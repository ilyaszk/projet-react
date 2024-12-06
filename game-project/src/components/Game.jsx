import PlusOuMoins from "./Screen/ScreenGame.jsx";
import Puissance from "./Screen/ScreenGame.jsx";

export default function Game() {
    return (
        <div className="bg-white dark:bg-black h-screen">
            <h1 className="text-4xl font-bold text-black dark:text-white text-center">Game</h1>
            <div className="flex justify-center w-full  ">
                <Puissance/>
            </div>
        </div>
    )
}
