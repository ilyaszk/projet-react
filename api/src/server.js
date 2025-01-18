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

// Ajout après la configuration existante de Socket.IO
const games = new Map(); // Stockage des états de jeu

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 20;
const BALL_SIZE = 10;
const BALL_SPEED = 5;

const createGameState = () => ({
    ball: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        dx: BALL_SPEED,
        dy: BALL_SPEED
    },
    paddles: {
        left: { y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
        right: { y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 }
    },
    scores: {
        left: 0,
        right: 0
    }
});

app.ready().then(() => {
    app.io.on('connection', (socket) => {
        console.log(`Player connected: ${socket.id}`);

        socket.on('joinGame', ({ roomId, username }) => {
            socket.join(roomId);

            const room = app.io.sockets.adapter.rooms.get(roomId);
            if (room && room.size <= 2) {
                if (room.size === 2) {
                    // Créer un nouvel état de jeu
                    games.set(roomId, createGameState());

                    // Informer les joueurs que le jeu commence
                    app.io.to(roomId).emit('gameStart', {
                        gameState: games.get(roomId),
                        playerPositions: {
                            left: Array.from(room)[0],
                            right: Array.from(room)[1]
                        }
                    });

                    // Démarrer la boucle de jeu pour cette room
                    startGameLoop(roomId);
                }
            } else {
                socket.emit('roomFull');
            }
        });

        socket.on('paddleMove', ({ roomId, position, player }) => {
            const gameState = games.get(roomId);
            if (gameState) {
                const paddle = player === 'left' ? gameState.paddles.left : gameState.paddles.right;
                paddle.y = Math.max(0, Math.min(position, CANVAS_HEIGHT - PADDLE_HEIGHT));
            }
        });

        socket.on('disconnect', () => {
            // Nettoyer les jeux où le joueur était présent
            for (const [roomId, gameState] of games.entries()) {
                const room = app.io.sockets.adapter.rooms.get(roomId);
                if (!room || room.size < 2) {
                    games.delete(roomId);
                    app.io.to(roomId).emit('gameEnd', { reason: 'playerDisconnected' });
                }
            }
        });
    });
});

function startGameLoop(roomId) {
    const gameInterval = setInterval(() => {
        const gameState = games.get(roomId);
        if (!gameState) {
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

        // Vérifier la victoire
        if (gameState.scores.left >= 10 || gameState.scores.right >= 10) {
            app.io.to(roomId).emit('gameEnd', {
                winner: gameState.scores.left >= 10 ? 'left' : 'right',
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

        await app.listen({port: 3000});
        console.log("Serveur Fastify lancé sur " + chalk.blue("http://localhost:3000"));
        console.log(chalk.bgYellow("Accéder à la documentation sur http://localhost:3000/documentation"));
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};
start();