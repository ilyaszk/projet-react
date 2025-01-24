import { useEffect } from "react";
import { Outlet } from "react-router-dom";

export default function LayoutRegistration() {
  useEffect(() => {
    localStorage.getItem("theme") === "dark" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  return (
    <div className="h-screen flex flex-col min-w-[300px] min-h-screen">
      {/* Header with logo */}
      <nav
        className="dark:bg-gradient-to-r dark:from-gray-900 dark:via-purple-900 dark:to-black dark:border-cyan-400
   bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 border-yellow-400 h-20 p-4 border-b-4 shadow-lg transition-colors duration-300"
      >
        <div className="mx-auto">
          <div className="flex items-center justify-center h-full">
            {/* Logo */}
            <h1
              className="dark:text-cyan-400 text-white text-4xl font-bold hover:scale-105 transition-all duration-300 cursor-default"
              style={{
                textShadow:
                  "2px 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(255,255,255,0.8)",
              }}
            >
              Game Project
              <span className="dark:text-cyan-400 text-yellow-400">🎮</span>
            </h1>
          </div>
        </div>
      </nav>
      {/* Content area */}
      <div
        className="flex-1 dark:bg-gradient-to-r dark:from-gray-900 dark:via-purple-900 dark:to-black
       bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500
       flex justify-center items-center"
      >
        <Outlet />
      </div>
    </div>
  );
}
