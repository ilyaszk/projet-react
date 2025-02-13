const CustomGameAlert = ({ winner, scores, reason, onClose }) => {
  if (!winner && !reason) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-80 min-h-[100px] bg-gray-800 border border-blue-500 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        {/* Title */}
        <div className="text-lg font-bold text-blue-400 mb-2">
          {reason === "playerDisconnected"
            ? "Player Disconnected!"
            : "We have a winner!"}
        </div>

        {/* Content */}
        <div className="text-white">
          {reason === "playerDisconnected" ? (
            <p>The other player has disconnected from the game.</p>
          ) : (
            <div>
              <p className="mb-1">
                <span className="font-semibold capitalize">{winner}</span> side
                wins!
              </p>
              <p className="text-sm text-gray-300">
                Final Score: {scores[winner]} points
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomGameAlert;
