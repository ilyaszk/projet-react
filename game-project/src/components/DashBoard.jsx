import { Link } from "react-router-dom";

export default function DashBoard() {
    const username = "Player 1";
    const bestScore = 11000005;

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-neon-black transition-colors duration-300">
            {/* Titre et description du jeu */}
            <div className="text-center mb-12">
                <h1 className="text-6xl font-extrabold text-neon-blue dark:text-neon-green neon-glow glitch-text">
                    Ultimate Game Challenge
                </h1>
                <p className="text-xl text-neon-green dark:text-neon-blue mt-4 neon-glow">
                    Are you ready for the ultimate test of skill? Join the adventure and compete for the top score!
                </p>
            </div>

            {/* Bouton pour accéder à la page du jeu */}
            <Link to="/game">
                <button
                    className="bg-neon-blue text-black dark:text-white font-bold py-3 px-8 rounded-lg hover:bg-neon-pink hover:text-white transition-transform duration-300 transform hover:scale-105 neon-glow"
                >
                    Play Now
                </button>
            </Link>

            {/* Encadré avec les informations du profil du joueur */}
            <div className="mt-12 bg-black dark:bg-gray-800 p-8 rounded-lg shadow-2xl border-4 border-neon-pink neon-glow max-w-sm w-full">
                <h3 className="text-2xl font-bold text-neon-blue dark:text-neon-green mb-4 text-center neon-glow">
                    Player Profile
                </h3>
                <div className="text-neon-green dark:text-neon-blue text-lg">
                    <p className="mb-2"><strong>Username:</strong> {username}</p>
                    <p><strong>Best Score:</strong> {bestScore}</p>
                </div>
            </div>
        </div>
    );
}
