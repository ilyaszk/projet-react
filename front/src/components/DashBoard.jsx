import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchData } from "../services/ws-services.jsx";

export default function DashBoard() {
  const [scoreBoard, setScoreBoard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderBoard = async () => {
      try {
        const data = await fetchData("/users/scoreBoard");
        setScoreBoard(data);
      } catch (error) {
        console.error("Error fetching leaderboard", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderBoard();
  }, []);

  return (
    <div
      className="dark:bg-gradient-to-r dark:from-gray-900 dark:via-purple-900 dark:to-black 
   dark:border-cyan-400 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 
   border-yellow-400 h-full p-8"
    >
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h1
          className="text-6xl font-black mb-6 bg-clip-text text-transparent
     dark:bg-gradient-to-r dark:from-cyan-400 dark:to-blue-600
     bg-gradient-to-r from-yellow-400 to-white"
        >
          Ultimate Game Challenge
        </h1>
        <p className="text-2xl text-white max-w-2xl mx-auto">
          Are you ready for the ultimate test of skill? Join the adventure!
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-8">
        <div
          className="backdrop-blur-sm p-8 rounded-2xl border-2 shadow-lg
     dark:bg-gradient-to-br dark:from-gray-800/50 dark:to-gray-900/50 dark:border-cyan-400 dark:shadow-cyan-500/20
     bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-yellow-400 shadow-yellow-500/20"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Leaderboard</h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-2
           dark:border-cyan-400 border-yellow-400"
              ></div>
            </div>
          ) : (
            <div className="space-y-4 overflow-scroll h-64 overflow-x-hidden">
              {scoreBoard.map((user, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-xl border
             ${
               index === 0
                 ? "bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border-yellow-500"
                 : "bg-gray-800/50 border-gray-700"
             }`}
                >
                  <div className="flex items-center space-x-4">
                    <span
                      className={`font-bold text-lg w-6 
                 ${index === 0 ? "text-yellow-400" : "text-gray-400"}`}
                    >
                      #{index + 1}
                    </span>
                    <span className="text-white font-medium">
                      {user.username}
                    </span>
                  </div>
                  <span className="dark:text-cyan-400 text-yellow-400 font-bold">
                    {user.score}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-center mt-16">
        <Link to="/game">
          <button
            className="group relative px-8 py-4 font-bold text-lg rounded-full transition-all duration-300 hover:scale-105
       dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-500 dark:hover:from-cyan-600 dark:hover:to-blue-600 dark:text-white dark:hover:shadow-lg dark:hover:shadow-cyan-500/50
       bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black hover:shadow-lg hover:shadow-yellow-500/50"
          >
            <span className="relative z-10 flex items-center justify-center space-x-2 rounded-full">
              <span>PLAY NOW</span>
              <span className="text-2xl">🎮</span>
            </span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full
         dark:bg-gradient-to-r dark:from-cyan-400 dark:to-blue-400
         bg-gradient-to-r from-yellow-300 to-yellow-500"
            ></div>
          </button>
        </Link>
      </div>
    </div>
  );
}
