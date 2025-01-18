import chalk from "chalk";
// Pour fastify
import fastify from "fastify";
import fastifyBcrypt from "fastify-bcrypt";
import cors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyJWT from "@fastify/jwt";
// Routes
import { usersRoutes } from "./routes/users.js";
import { gamesRoutes } from "./routes/games.js";
// BDD
import { sequelize } from "./bdd.js";
// Socket.io
import socketioServer from "fastify-socket.io";
import { updateScore } from "./controllers/users.js";

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
            return reply.status(401).send({ error: "Token invalide ou expiré" });
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

// Store for players and game state
let players = {};
let currentGame = {
    board: Array(6).fill(null).map(() => Array(7).fill(null)), // Empty board 6x7
    currentPlayer: 1, // Player 1 starts
    winner: null,
};

app.ready().then(() => {
    app.io.on('connection', (socket) => {
        console.log(`Player connected: ${socket.id}`);

        // Handle player joining a room
        socket.on('joinRoom', ({ username, roomCode }) => {
            socket.join(roomCode);
            players[socket.id] = { username, roomCode };
            console.log(`${username} joined room ${roomCode}`);

            const roomPlayers = Object.values(players).filter(player => player.roomCode === roomCode);
            if (roomPlayers.length === 2) {
                const [firstPlayer, secondPlayer] = roomPlayers;
                app.io.to(roomCode).emit('gameReady', {
                    firstPlayer: firstPlayer.username,
                    secondPlayer: secondPlayer.username
                });
            }
        });

        // Handle player move
        socket.on('makeMove', ({ board, nextPlayer, roomCode }) => {
            console.log('Move made:', board, 'Next player:', nextPlayer);
            currentGame.board = board;
            currentGame.currentPlayer = nextPlayer;
            app.io.to(roomCode).emit('opponentMove', { board, nextPlayer });
        });

        // Handle game won
        socket.on('gameWon', ({ winner, idWin, roomCode }) => {
            console.log('Game won by:', winner);
            console.log('idWin', idWin);
            const userUpdte = updateScore(idWin);
            app.io.to(roomCode).emit('gameWon', { winner, userUpdte });
        });

        // Handle game reset
        socket.on('resetGame', (roomCode) => {
            currentGame.board = Array(6).fill(null).map(() => Array(7).fill(null));
            currentGame.currentPlayer = 1;
            app.io.to(roomCode).emit('gameReset');
        });

        // Handle player disconnect
        socket.on('disconnect', () => {
            console.log(`Player disconnected: ${socket.id}`);
            const player = players[socket.id];
            if (player) {
                const roomCode = player.roomCode;
                delete players[socket.id];
                const roomPlayers = Object.values(players).filter(player => player.roomCode === roomCode);
                if (roomPlayers.length < 2) {
                    app.io.to(roomCode).emit('playerDisconnected');
                }
            }
        });
    });
});

/**********
 * START SERVER
 **********/
const start = async () => {
    try {
        await sequelize
            .sync({ alter: true })
            .then(() => {
                console.log(chalk.green("Base de données synchronisée."));
            })
            .catch((error) => {
                console.error("Erreur de synchronisation de la base de données :", error);
            });

        await app.listen({ port: 3000 });
        console.log("Serveur Fastify lancé sur " + chalk.blue("http://localhost:3000"));
        console.log(chalk.bgYellow("Accéder à la documentation sur http://localhost:3000/documentation"));
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};
start();