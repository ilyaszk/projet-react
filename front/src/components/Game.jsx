import PongGame from "./Screen/ScreenGame.jsx";

export default function Game() {
  return (
    <div
      className="h-full dark:bg-gradient-to-r dark:from-gray-900 dark:via-purple-900 dark:to-black
    bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500
    flex flex-col items-center"
    >
      <h1
        className="text-5xl font-extrabold text-center py-8 text-transparent bg-clip-text
            dark:bg-gradient-to-r dark:from-cyan-400 dark:to-blue-600
            bg-gradient-to-r from-yellow-400 to-white"
      >
        Game
      </h1>

      <div
        className="p-6 rounded-lg shadow-2xl
            dark:bg-gradient-to-br dark:from-gray-800/50 dark:to-gray-900/50 dark:border-cyan-400 dark:shadow-cyan-500/20
            bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-yellow-400 shadow-yellow-500/20"
      >
        <PongGame />
      </div>
    </div>
  );
}
