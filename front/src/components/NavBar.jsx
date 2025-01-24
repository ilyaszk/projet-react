import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

// eslint-disable-next-line react/prop-types
export default function NavBar({ onLogout }) {
  const handleLogout = () => {
    onLogout();
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [user, setUser] = useState({});

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem("token") !== null);
    if (isAuthenticated) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode, isAuthenticated]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <nav
      className="dark:bg-gradient-to-r dark:from-gray-900 dark:via-purple-900 dark:to-black dark:border-cyan-400
   bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 border-yellow-400 h-20 p-4 border-b-4 shadow-lg transition-colors duration-300"
    >
      <div className="mx-auto">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link
            to="/"
            className="dark:text-cyan-400 text-white text-4xl font-bold hover:scale-105 transition-all duration-300"
            style={{
              textShadow:
                "2px 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(255,255,255,0.8)",
            }}
          >
            Game Project{" "}
            <span className="dark:text-cyan-400 text-yellow-400">🎮</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:block">
            <ul className="flex space-x-8">
              {["Home", "Game"].map((item) => (
                <li key={item} className="group">
                  <NavLink
                    to={item === "Home" ? "/" : "/game"}
                    className={({ isActive }) => `
          text-lg font-bold relative px-4 py-2 transition-all duration-300
          ${
            isActive
              ? "dark:text-cyan-200 text-yellow-300"
              : "dark:text-cyan-600 text-white"
          }
          hover:scale-105
        `}
                    end={item === "Home"} // Pour que "/" ne soit actif que sur la page d'accueil exacte
                  >
                    {item}
                    <span
                      className={`absolute bottom-0 left-0 h-1 
          dark:bg-cyan-400 bg-yellow-400
          transition-all duration-300 
          w-0 group-hover:w-full`} // Pour l'effet de soulignement
                    ></span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Dark Mode & Auth */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={toggleDarkMode}
              className="dark:bg-gradient-to-r dark:from-cyan-900 dark:to-cyan-800 dark:border-cyan-700
           bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700 
           text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl border-2 hover:scale-105 transition-all duration-300"
            >
              {isDarkMode ? "☀️ Light" : "🌙 Dark"}
            </button>

            {isAuthenticated && (
              <>
                <Link
                  onClick={handleLogout}
                  to="/auth"
                  className="dark:bg-gradient-to-r dark:from-red-900 dark:to-red-800 dark:border-red-700
               bg-gradient-to-r from-red-800 to-red-900 border-red-700 
               text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl border-2 hover:scale-105 transition-all duration-300"
                >
                  🔒 Logout
                </Link>
                <span
                  className="dark:bg-gradient-to-r dark:from-cyan-600 dark:to-cyan-400
             bg-gradient-to-r from-yellow-400 to-yellow-600
             px-4 py-1 rounded-full shadow-md text-white text-lg font-bold"
                >
                  👤 {user.username}
                </span>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white p-2 rounded-lg border-2 hover:scale-105 transition-all duration-300
         dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 dark:border-cyan-400
         bg-gradient-to-r from-gray-800 to-gray-900 border-yellow-400"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${
          isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }
   fixed top-0 left-0 w-full
   dark:bg-gradient-to-b dark:from-gray-900 dark:to-purple-900 dark:border-cyan-400
   bg-gradient-to-b from-blue-600 to-purple-600 border-yellow-400
   transform transition-all duration-300 ease-in-out z-50 shadow-xl rounded-b-xl border-b-4`}
      >
        <div className="p-6">
          {/* Close button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleMenu}
              className="dark:text-cyan-400 dark:hover:text-cyan-300 
       text-white hover:text-yellow-400 transition-colors duration-300"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* User info */}
          {isAuthenticated && (
            <div className="mb-6 text-center">
              <span
                className="inline-block dark:bg-gradient-to-r dark:from-cyan-600 dark:to-cyan-400
       bg-gradient-to-r from-yellow-400 to-yellow-600
       px-6 py-2 rounded-full text-white font-bold shadow-md text-lg"
              >
                👤 {user.username}
              </span>
            </div>
          )}

          {/* Menu items */}
          <ul className="space-y-4">
            {["Home", "Game"].map((item) => (
              <li key={item} className="text-center">
                <Link
                  to={item === "Home" ? "/" : "/game"}
                  onClick={toggleMenu}
                  className="inline-block w-full dark:text-cyan-400 text-white 
           text-xl font-bold hover:bg-white/10 rounded-xl px-6 py-3 
           transition-all duration-300 hover:scale-105"
                >
                  {item}
                </Link>
              </li>
            ))}

            <li className="text-center">
              <button
                onClick={toggleDarkMode}
                className="dark:bg-gradient-to-r dark:from-cyan-900 dark:to-cyan-800 dark:border-cyan-700
         bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700
         text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl 
         transition-all duration-300 border-2 hover:scale-105"
              >
                {isDarkMode ? "☀️ Light" : "🌙 Dark"}
              </button>
            </li>

            {isAuthenticated && (
              <li className="text-center">
                <Link
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  to="/auth"
                  className="inline-block w-full text-white text-xl font-bold
           dark:bg-gradient-to-r dark:from-red-700 dark:to-red-600
           bg-gradient-to-r from-red-500 to-red-600
           rounded-xl px-6 py-3 transition-all duration-300 
           hover:scale-105 shadow-md"
                >
                  Logout
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Overlay pour le menu mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleMenu}
        ></div>
      )}
    </nav>
  );
}
