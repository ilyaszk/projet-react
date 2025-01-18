import Puissance from "./Screen/ScreenGame.jsx";

export default function Game() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 dark:from-gray-900 dark:to-black text-black dark:text-white">
      <h1 className="text-5xl font-extrabold text-center py-8 bg-gradient-to-r from-purple-500 to-indigo-500 text-transparent bg-clip-text">
        Game
      </h1>
      <div className="flex justify-center items-center h-full">
        <div className="p-6 rounded-lg shadow-2xl bg-white dark:bg-gray-800">
          <Puissance />
        </div>
      </div>
    </div>
  );
}
