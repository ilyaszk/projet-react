/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable dark mode based on a class on the <html> element
    theme: {
        extend: {
            colors: {
                'neon-green': '#39FF14',
                'neon-blue': '#00FFFF',
                'neon-pink': '#FF1493',
                'neon-red': '#FF0000',
                'neon-black': '#000000',
            },
            fontFamily: {
                futuristic: ['Orbitron', 'sans-serif'], // Ajouter une police futuriste
            },
        },
    },
    plugins: [],
}
