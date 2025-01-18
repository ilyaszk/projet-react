import chalk from "chalk";
// Pour fastify
import fastify from "fastify";
import fastifyBcrypt from "fastify-bcrypt";
import cors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyJWT from "@fastify/jwt";
// Routes
import {usersRoutes} from "./routes/users.js";
import {gamesRoutes} from "./routes/games.js";
// BDD
import {sequelize} from "./bdd.js";
// Socket.io
import socketioServer from "fastify-socket.io";
import {updateScore} from "./controllers/users.js";

// Test de la connexion
try {
    sequelize.authenticate();
    console.log(chalk.grey("Connecté à la base de données MySQL!"));
} catch (error) {
    console.error("Impossible de se connecter, erreur suivante :", error);
}

/**
 * API avec fastify
 */
let blacklistedTokens = [];
const app = fastify();

// Ajout du plugin fastify-bcrypt pour le hash du mdp
await app
    .register(fastifyBcrypt, {
        saltWorkFactor: 12,
    })
    .register(cors, {
        origin: "*",
        method: ["GET", "POST"],
    })
    .register(fastifySwagger, {
        openapi: {
            openapi: "3.0.0",
            info: {
                title: "Documentation de l'API JDR LOTR",
                description:
                    "API développée pour un exercice avec React avec Fastify et Sequelize",
                version: "0.1.0",
            },
        },
    })
    .register(socketioServer, {
        cors: {
            origin: "*",
        },
    })
    .register(fastifySwaggerUi, {
        routePrefix: "/documentation",
        theme: {
            title: "Docs - JDR LOTR API",
        },
        uiConfig: {
            docExpansion: "list",
            deepLinking: false,
        },
        uiHooks: {
            onRequest: function (request, reply, next) {
                next();
            },
            preHandler: function (request, reply, next) {
                next();
            },
        },
        staticCSP: true,
        transformStaticCSP: (header) => header,
        transformSpecification: (swaggerObject, request, reply) => {
            return swaggerObject;
        },
        transformSpecificationClone: true,
    })
    .register(fastifyJWT, {
        secret: "unanneaupourlesgouvernertous",
    });

// Fonction pour décoder et vérifier le token
app.decorate("authenticate", async (request, reply) => {
    try {
        const token = request.headers["authorization"].split(" ")[1];

        // Vérifier si le token est dans la liste noire
        if (blacklistedTokens.includes(token)) {
            return reply.status(401).send({error: "Token invalide ou expiré"});
        }
        await request.jwtVerify();
    } catch (err) {
        reply.send(err);
    }
});

// Gestion utilisateur
usersRoutes(app);
// Gestion des jeux
gamesRoutes(app);

/**
 * SOCKET.IO Logic
 */

// Structure pour gérer les salles de jeu
// Structure pour gérer les salles de jeu
const rooms = new Map();
const games = new Map();

// Constantes du jeu
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 20;
const BALL_SIZE = 10;
const BALL_SPEED = 5;

// Configuration d'une salle
class GameRoom {
    constructor(roomId, roomName, hostId) {
        this.roomId = roomId;
        this.roomName = roomName;
        this.players = new Map();
        this.status = 'waiting'; // waiting, playing, finished
    }

    addPlayer(playerId, playerName, userId) {  // Ajout du paramètre userId
        const side = this.players.size === 0 ? 'left' : 'right';
        this.players.set(playerId, {
            name: playerName,
            userId: userId,  // Stockage de l'userId
            side: side,
            ready: true
        });
        console.log(`Joueur ajouté à la salle ${this.roomId}: ${playerName}, côté ${side}, userId: ${userId}`);
        return true;
    }

    removePlayer(playerId) {
        this.players.delete(playerId);
        if (this.players.size === 0) {
            rooms.delete(this.roomId);
        }
    }

    getPlayerCount() {
        return this.players.size;
    }

    isFull() {
        return this.players.size >= 2;
    }

    getPlayersInfo() {
        return Array.from(this.players.entries()).map(([id, data]) => ({
            id,
            ...data
        }));
    }
}

function createGameState() {
    return {
        ball: {
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
            dx: BALL_SPEED,
            dy: BALL_SPEED
        },
        paddles: {
            left: {y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2},
            right: {y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2}
        },
        scores: {
            left: 0,
            right: 0
        }
    };
}

app.ready().then(() => {
    app.io.on('connection', (socket) => {
        console.log(`Joueur connecté: ${socket.id}`);

        // Obtenir la liste des salles
        socket.on('getRooms', () => {
            const roomsList = Array.from(rooms.values()).map(room => ({
                roomId: room.roomId,
                roomName: room.roomName,
                status: room.status,
                players: room.getPlayersInfo().map(p => p.name),
                playerCount: room.getPlayerCount()
            }));
            socket.emit('roomsList', roomsList);
        });

        // Créer une nouvelle salle
        socket.on('createRoom', ({roomName, playerName, userId}) => {
            try {
                const roomId = `room_${Date.now()}`;
                const newRoom = new GameRoom(roomId, roomName);

                // Ajouter le premier joueur
                newRoom.addPlayer(socket.id, playerName,userId);

                // Sauvegarder la salle
                rooms.set(roomId, newRoom);

                // Rejoindre la room socket.io
                socket.join(roomId);

                // Notifier le créateur
                socket.emit('roomCreated', {
                    roomId,
                    roomName,
                    players: newRoom.getPlayersInfo()
                });

                // Notifier tout le monde de la nouvelle salle
                app.io.emit('roomAdded', {
                    roomId,
                    roomName,
                    players: [playerName],
                    status: 'waiting'
                });

                console.log(`Salle créée: ${roomName} (${roomId})`);
            } catch (error) {
                console.error('Erreur création salle:', error);
                socket.emit('error', {message: 'Erreur lors de la création de la salle'});
            }
        });

        // Rejoindre une salle
        socket.on('joinRoom', ({roomId, playerName, userId}) => {
            try {
                const room = rooms.get(roomId);

                if (!room) {
                    socket.emit('error', {message: 'Cette salle n\'existe pas'});
                    return;
                }

                if (room.isFull()) {
                    socket.emit('error', {message: 'La salle est pleine'});
                    return;
                }

                if (room.status !== 'waiting') {
                    socket.emit('error', {message: 'Une partie est déjà en cours'});
                    return;
                }

                // Ajouter le joueur à la salle
                room.addPlayer(socket.id, playerName, userId);

                // Rejoindre la room socket.io
                socket.join(roomId);

                // Informer tous les joueurs de la salle
                app.io.to(roomId).emit('playerJoined', {
                    players: room.getPlayersInfo()
                });

                // Si la salle est pleine, démarrer le jeu
                if (room.isFull()) {
                    room.status = 'playing';
                    games.set(roomId, createGameState());

                    const players = room.getPlayersInfo();
                    const leftPlayer = players.find(p => p.side === 'left');
                    const rightPlayer = players.find(p => p.side === 'right');

                    // Envoyer l'état initial à tous les joueurs
                    app.io.to(roomId).emit('gameStart', {
                        gameState: games.get(roomId),
                        playerPositions: {
                            left: leftPlayer.id,
                            right: rightPlayer.id
                        }
                    });

                    // Envoyer une confirmation individuelle à chaque joueur
                    socket.emit('playerAssigned', {side: 'right'});
                    const otherSocket = Array.from(room.players.keys()).find(id => id !== socket.id);
                    if (otherSocket) {
                        app.io.to(otherSocket).emit('playerAssigned', {side: 'left'});

                        startGameLoop(roomId);
                    }

                    console.log(`${playerName} a rejoint la salle ${roomId}`);
                }
            } catch (error) {
                console.error('Erreur join room:', error);
                socket.emit('error', {message: 'Erreur lors de la tentative de rejoindre la salle'});
            }
        });

        // Gestion des mouvements de paddle
        socket.on('paddleMove', ({roomId, position, player}) => {
            const gameState = games.get(roomId);
            if (gameState) {
                const paddle = player === 'left' ? gameState.paddles.left : gameState.paddles.right;
                paddle.y = Math.max(0, Math.min(position, CANVAS_HEIGHT - PADDLE_HEIGHT));
            }
        });

        // Gestion de la déconnexion
        socket.on('disconnect', () => {
            for (const [roomId, room] of rooms.entries()) {
                if (room.players.has(socket.id)) {
                    room.removePlayer(socket.id);

                    if (room.getPlayerCount() === 0) {
                        rooms.delete(roomId);
                        games.delete(roomId);
                        app.io.emit('roomRemoved', {roomId});
                    } else {
                        if (games.has(roomId)) {
                            games.delete(roomId);
                            room.status = 'waiting';
                            app.io.to(roomId).emit('gameEnd', {
                                reason: 'playerDisconnected',
                                message: 'L\'autre joueur s\'est déconnecté'
                            });
                        }
                    }
                }
            }
            console.log(`Joueur déconnecté: ${socket.id}`);
        });
    });
});


function startGameLoop(roomId) {
    const gameInterval = setInterval(async () => {
        const gameState = games.get(roomId);
        const room = rooms.get(roomId);

        if (!gameState || !room) {
            clearInterval(gameInterval);
            return;
        }

        // Mise à jour de la position de la balle
        gameState.ball.x += gameState.ball.dx;
        gameState.ball.y += gameState.ball.dy;

        // Collision avec les murs (haut/bas)
        if (gameState.ball.y <= 0 || gameState.ball.y >= CANVAS_HEIGHT - BALL_SIZE) {
            gameState.ball.dy *= -1;
        }

        // Collision avec les paddles
        const checkPaddleCollision = (x, paddleY) => {
            return gameState.ball.y >= paddleY &&
                gameState.ball.y <= paddleY + PADDLE_HEIGHT;
        };

        if (gameState.ball.x <= PADDLE_WIDTH &&
            checkPaddleCollision(PADDLE_WIDTH, gameState.paddles.left.y)) {
            gameState.ball.dx *= -1;
        }

        if (gameState.ball.x >= CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE &&
            checkPaddleCollision(CANVAS_WIDTH - PADDLE_WIDTH, gameState.paddles.right.y)) {
            gameState.ball.dx *= -1;
        }

        // Point marqué
        if (gameState.ball.x <= 0) {
            gameState.scores.right++;
            resetBall(gameState);
        } else if (gameState.ball.x >= CANVAS_WIDTH) {
            gameState.scores.left++;
            resetBall(gameState);
        }

        // Envoyer l'état mis à jour aux clients
        app.io.to(roomId).emit('gameState', gameState);

        // Dans la fonction startGameLoop, remplacer le bloc de vérification de victoire
        if (gameState.scores.left >= 3 || gameState.scores.right >= 3) {
            room.status = 'finished';
            // Réinitialiser l'état "ready" des joueurs pour le rematch
            room.players.forEach(player => player.ready = false);

            const winnerSide = gameState.scores.left >= 3 ? 'left' : 'right';

            // Trouver le joueur gagnant et son userId
            const winningPlayer = Array.from(room.players.values())
                .find(player => player.side === winnerSide);

            if (winningPlayer && winningPlayer.userId) {
                try {
                    await updateScore(winningPlayer.userId);
                    console.log(`Score mis à jour pour le joueur ${winningPlayer.name}`);
                } catch (error) {
                    console.error('Erreur lors de la mise à jour du score:', error);
                }
            }

            app.io.to(roomId).emit('gameEnd', {
                winner: winnerSide,
                scores: gameState.scores
            });

            games.delete(roomId);
            clearInterval(gameInterval);
        }
    }, 1000 / 60); // 60 FPS
}

function resetBall(gameState) {
    gameState.ball.x = CANVAS_WIDTH / 2;
    gameState.ball.y = CANVAS_HEIGHT / 2;
    gameState.ball.dx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    gameState.ball.dy = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
}

/**********
 * START SERVER
 **********/
const start = async () => {
    try {
        await sequelize
            .sync({alter: true})
            .then(() => {
                console.log(chalk.green("Base de données synchronisée."));
            })
            .catch((error) => {
                console.error("Erreur de synchronisation de la base de données :", error);
            });

        await app.listen({port: process.env.PORT || 3000 });
        console.log("Serveur Fastify lancé sur " + chalk.blue("http://localhost:3000"));
        console.log(chalk.bgYellow("Accéder à la documentation sur http://localhost:3000/documentation"));
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};
start();