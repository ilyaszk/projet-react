// gameController.js
import Game from "../models/games.js";

// Création de la partie avec le créateur (Joueur 1)
export async function createGame(userId, secretNumber) {
    if (!userId) {
        return {error: "L'identifiant du joueur est manquant"};
    }
    if (!secretNumber) {
        return {error: "Le nombre secret est manquant"};
    }

    // Création du jeu en base de données
    const datas = await Game.create({creator: userId, secretNumber});
    return {gameId: datas.dataValues.id};
}

// Rejoindre et mettre à jour une partie
export async function updateGame(request) {
    const userId = request.body.userId;

    if (!userId) {
        return {error: "L'identifiant du joueur est manquant"};
    }

    const {action, gameId} = request.params;
    if (!gameId) {
        return {error: "L'identifiant de la partie est manquant"};
    }

    const game = await Game.findByPk(gameId);
    if (!game) {
        return {error: "La partie n'existe pas."};
    }

    if (game.state === "finished") {
        return {error: "Cette partie est déjà terminée !"};
    }

    switch (action) {
        case "join":
            if (game.player2) {
                return {error: "Il y a déjà 2 joueurs dans cette partie !"};
            }
            if (game.state !== "pending") {
                return {error: "Cette partie n'est plus en attente."};
            }
            game.player2 = userId; // Enregistrer le joueur 2
            game.state = "playing"; // Mettre à jour l'état du jeu à 'playing'
            break;
        case "finish":
            if (!request.body.score) {
                return {error: "Le score est manquant."};
            }
            game.state = "finished"; // Mettre l'état à 'finished'
            game.winnerScore = request.body.score;
            game.winner = request.body.winner;
            break;
        default:
            return {error: "Action inconnue"};
    }

    await game.save();
    return game;
}