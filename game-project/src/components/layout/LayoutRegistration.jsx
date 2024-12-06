import {Outlet} from 'react-router-dom';

export default function LayoutRegistration() {
    return (
        <div>
            {/* This is where the children routes will be rendered */}
            <h1 className="text-5xl font-extrabold text-center bg-neon-black text-neon-blue p-6 neon-glow">
                Game Project <span className="text-7xl glitch-text">🎮</span>
            </h1>
            <div className="content bg-white dark:bg-black border-4 border-neon-pink p-8  shadow-2xl neon-glow">
                <Outlet/>
            </div>

        </div>
    );
}
