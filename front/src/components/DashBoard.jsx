import {Link} from "react-router-dom";
import {useEffect, useState} from "react";
import {fetchData} from "../services/ws-services.jsx";


export default function DashBoard() {
    const [scoreBoard, setScoreBoard] = useState([]);

    useEffect(() => {
        const fetchLeaderBoard = async () => {
            try {
                const data = await fetchData("/users/scoreBoard");
                setScoreBoard(data);
            } catch (error) {
                console.error("Error fetching leaderboard", error);
            }
        };
        fetchLeaderBoard().then(r => console.log(r));
    }, []);

    return (
        <div
            className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 dark:from-black dark:to-gray-900 transition-colors duration-500">
            {/* Titre et description du jeu */}
            <div className="text-center mb-12">
                <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green neon-glow">
                    Ultimate Game Challenge
                </h1>
                <p className="text-2xl text-gray-800 dark:text-gray-300 mt-6  neon-glow">
                    Are you ready for the ultimate test of skill? Join the adventure and
                    compete for the top score!
                </p>
            </div>

            {/* Bouton pour accéder à la page du jeu */}
            <Link to="/game">
                <button
                    className="bg-neon-blue text-white dark:text-black font-bold py-4 px-12 rounded-full shadow-xl hover:bg-neon-pink hover:shadow-2xl hover:text-white transition-transform duration-300 transform hover:scale-110 neon-glow">
                    Play Now
                </button>
            </Link>

            {/* Encadré avec les informations du profil du joueur */}
            <div
                className="mt-16 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border-4 border-neon-pink neon-glow max-w-sm w-full">
                <h3 className="text-3xl font-extrabold text-neon-blue dark:text-neon-green mb-6 text-center neon-glow">
                    Leaderboard
                </h3>
                <div className="text-lg text-gray-700 dark:text-gray-300">
                    {scoreBoard.map((user, index) => (
                        <div key={index} className="flex justify-between mb-2">
                            <span>{user.username}</span>
                            <span>{user.score}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
