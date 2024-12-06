import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function NavBar({ onLogout }) {
  const handleLogout = () => {
    onLogout(); // Appeler la fonction pour mettre à jour l'état d'authentification
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false); // État d'authentification
  const [isOpen, setIsOpen] = useState(false); // Burger menu state
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
  ); // Dark mode state

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem("token") !== null);
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
    <nav className="bg-gradient-to-r from-indigo-800 via-purple-900 to-black h-20 p-4 shadow-lg border-b-4 border-neon-pink">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative flex items-center justify-between h-full">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link
            to="/"
            className="text-neon-blue dark:text-neon-green text-4xl font-extrabold font-futuristic tracking-wide neon-glow hover:scale-105 transition-transform duration-300"
          >
            Game Project <span className="text-5xl glitch-text">🎮</span>
          </Link>
        </div>
  
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="text-neon-blue dark:text-neon-pink text-xl px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 shadow-md transition-transform transform hover:scale-110"
        >
          {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
  
        {/* Burger Menu Icon for Mobile */}
        <div className="absolute inset-y-0 right-0 flex items-center sm:hidden">
          <button
            onClick={toggleMenu}
            type="button"
            className="inline-flex items-center justify-center p-3 rounded-md text-neon-blue hover:text-neon-blue hover:bg-gray-700 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-neon-pink transform hover:scale-110 transition-transform duration-300"
            aria-controls="mobile-menu"
            aria-expanded={isOpen ? "true" : "false"}
          >
            <span className="sr-only">Open main menu</span>
            {/* Burger icon */}
            <svg
              className="block h-8 w-8"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
            {/* Close icon */}
            <svg
              className={`${isOpen ? "block" : "hidden"} h-8 w-8`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
  
        {/* Links for larger screens */}
        <div className="hidden sm:block sm:ml-6">
          <ul className="flex space-x-8">
            <li className="text-neon-green dark:text-neon-pink text-lg font-semibold hover:text-neon-pink transform hover:scale-110 transition-transform duration-300 neon-glow">
              <Link to="/">Home</Link>
            </li>
            <li className="text-neon-green dark:text-neon-pink text-lg font-semibold hover:text-neon-pink transform hover:scale-110 transition-transform duration-300 neon-glow">
              <Link to="/game">Game</Link>
            </li>
            {isAuthenticated && (
              <li className="text-neon-green dark:text-neon-pink text-lg font-semibold hover:text-neon-pink transform hover:scale-110 transition-transform duration-300 neon-glow">
                <Link onClick={handleLogout} to="/auth">
                  Logout
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  
    {/* Mobile Menu */}
    <div
      className={`${isOpen ? "block" : "hidden"} sm:hidden`}
      id="mobile-menu"
    >
      <ul className="px-4 pt-4 pb-6 space-y-3">
        <li className="text-neon-green dark:text-neon-pink font-semibold hover:text-neon-pink transform hover:scale-110 transition-transform duration-300">
          <Link to="/">Home</Link>
        </li>
        <li className="text-neon-green dark:text-neon-pink font-semibold hover:text-neon-pink transform hover:scale-110 transition-transform duration-300">
          <Link to="/game">Game</Link>
        </li>
        {isAuthenticated && (
          <li className="text-neon-green dark:text-neon-pink font-semibold hover:text-neon-pink transform hover:scale-110 transition-transform duration-300">
            <Link onClick={handleLogout} to="/auth">
              Logout
            </Link>
          </li>
        )}
      </ul>
    </div>
  </nav>
  
  );
}
