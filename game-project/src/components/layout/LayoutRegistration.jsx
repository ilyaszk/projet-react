import { Outlet } from "react-router-dom";

export default function LayoutRegistration() {
  return (
    <div className="h-screen">
      {/* This is where the children routes will be rendered */}
      <h1 className="text-5xl h-1/6 font-extrabold text-center bg-neon-black text-neon-blue p-6 neon-glow">
        <a href="/">
          Game Project <span className="text-7xl glitch-text">🎮</span>
        </a>
      </h1>
      <div className="h-5/6 flex justify-center items-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-black dark:to-gray-900 transition-colors duration-500">
        <Outlet />
      </div>
    </div>
  );
}
