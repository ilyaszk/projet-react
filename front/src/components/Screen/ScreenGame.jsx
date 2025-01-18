import { useCallback, useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000", { autoConnect: false });

const Puissance = () => {
  const [board, setBoard] = useState(
    Array(6)
      .fill(null)
      .map(() => Array(7).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winner, setWinner] = useState(null);
  const [isGameReady, setIsGameReady] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [isRoomJoined, setIsRoomJoined] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user || !token) {
      alert("Please log in to start the game");
      window.location.href = "/signin";
    } else {
      if (!socket.connected) {
        socket.connect();
      }

      socket.on("gameReady", (gameData) => {
        console.log("Game is ready:", gameData);
        setIsGameReady(true);
        setIsMyTurn(gameData.firstPlayer === user.username);
      });

      socket.on("opponentMove", ({ board, nextPlayer }) => {
        console.log(
          "Opponent move received:",
          board,
          "Next player:",
          nextPlayer
        );
        setBoard(board);
        setCurrentPlayer(nextPlayer);
        setIsMyTurn(nextPlayer !== currentPlayer);
      });

      socket.on("gameWon", ({ winner, userUpdte }) => {
        console.log("Game won by:", winner);
        setWinner(winner);
        localStorage.setItem("user", JSON.stringify(userUpdte));
      });

      return () => {
        socket.off("gameReady");
        socket.off("opponentMove");
        socket.off("gameWon");
      };
    }
  }, [user, token]);

  const joinRoom = () => {
    socket.emit("joinRoom", { username: user.username, roomCode });
    setIsRoomJoined(true);
  };

  const checkWin = (board, player) => {
    const rows = board.length;
    const cols = board[0].length;

    // Check horizontal wins
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols - 3; col++) {
        if (
          board[row][col] === player &&
          board[row][col + 1] === player &&
          board[row][col + 2] === player &&
          board[row][col + 3] === player
        ) {
          return [
            [row, col],
            [row, col + 1],
            [row, col + 2],
            [row, col + 3],
          ]; // Return winning cells
        }
      }
    }

    // Check vertical wins
    for (let row = 0; row < rows - 3; row++) {
      for (let col = 0; col < cols; col++) {
        if (
          board[row][col] === player &&
          board[row + 1][col] === player &&
          board[row + 2][col] === player &&
          board[row + 3][col] === player
        ) {
          return [
            [row, col],
            [row + 1, col],
            [row + 2, col],
            [row + 3, col],
          ]; // Return winning cells
        }
      }
    }

    // Check diagonal wins (left to right)
    for (let row = 0; row < rows - 3; row++) {
      for (let col = 0; col < cols - 3; col++) {
        if (
          board[row][col] === player &&
          board[row + 1][col + 1] === player &&
          board[row + 2][col + 2] === player &&
          board[row + 3][col + 3] === player
        ) {
          return [
            [row, col],
            [row + 1, col + 1],
            [row + 2, col + 2],
            [row + 3, col + 3],
          ]; // Return winning cells
        }
      }
    }

    // Check diagonal wins (right to left)
    for (let row = 0; row < rows - 3; row++) {
      for (let col = 3; col < cols; col++) {
        if (
          board[row][col] === player &&
          board[row + 1][col - 1] === player &&
          board[row + 2][col - 2] === player &&
          board[row + 3][col - 3] === player
        ) {
          return [
            [row, col],
            [row + 1, col - 1],
            [row + 2, col - 2],
            [row + 3, col - 3],
          ]; // Return winning cells
        }
      }
    }

    // No win found
    return null;
  };

  const [winningCells, setWinningCells] = useState([]);

  const dropDisc = useCallback(
    (colIndex) => {
      if (!isMyTurn || winner) return;
      const rowIndex = board.map((row) => row[colIndex]).lastIndexOf(null);
      if (rowIndex === -1) return;

      const newBoard = board.map((row) => [...row]);
      newBoard[rowIndex][colIndex] = currentPlayer;
      setBoard(newBoard);

      // Check if the current player wins and get the winning cells
      const winningCellsResult = checkWin(newBoard, currentPlayer);
      if (winningCellsResult) {
        setWinner(user.username);
        setWinningCells(winningCellsResult); // Store the winning cells
        socket.emit("gameWon", {
          winner: user.username,
          idWin: user.id,
          roomCode,
        });
      } else {
        socket.emit("makeMove", {
          board: newBoard,
          nextPlayer: currentPlayer === 1 ? 2 : 1,
          roomCode,
        });
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        setIsMyTurn(false);
      }
    },
    [isMyTurn, winner, board, currentPlayer]
  );

  const resetGame = useCallback(() => {
    setBoard(
      Array(6)
        .fill(null)
        .map(() => Array(7).fill(null))
    ); // Reset the board
    setCurrentPlayer(1); // Reset to player 1's turn
    setWinner(null); // Clear winner
    setWinningCells([]); // Clear the highlighted winning cells
    socket.emit("resetGame", roomCode); // Notify the server
  }, [roomCode]);

  if (!isRoomJoined) {
    return (
      <div className="game-container flex flex-col items-center justify-center  bg-gradient-to-b from-indigo-900 to-purple-900 text-white">
        <h1 className="text-4xl font-extrabold mb-6 text-shadow-lg">
          Enter Room Code
        </h1>
        <input
          type="text"
          className="m-4 p-4 rounded-md h-12 w-80 text-lg border-2 border-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-indigo-50 text-indigo-900"
          value={roomCode}
          maxLength={4}
          pattern="[0-9]{4}"
          placeholder="Enter room code..."
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <button
          onClick={joinRoom}
          className="px-6 py-3 mt-4 bg-indigo-600 text-white font-semibold text-lg rounded-lg shadow-md hover:bg-indigo-500 hover:shadow-xl transition-all duration-300"
        >
          Join Room
        </button>
      </div>
    );
  }

  if (!isGameReady) {
    return (
      <div className="game-container flex flex-col items-center justify-center  bg-gradient-to-b from-indigo-900 to-purple-900 text-white">
        <h2 className="text-2xl font-medium mb-4 animate-pulse">
          Waiting for another player...
        </h2>
        <div className="spinner border-t-4 border-b-4 border-gray-400 w-16 h-16 rounded-full animate-spin"></div>
        <button
          onClick={() => {
            socket.emit("cancelRoom", roomCode);
            setIsRoomJoined(false);
          }}
          className="px-6 py-3 mt-4 bg-indigo-600 text-white font-semibold text-lg rounded-lg shadow-md hover:bg-indigo-500 hover:shadow-xl transition-all duration-300"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div
      className={`game-container ${isMyTurn ? "your-turn" : "opponent-turn"}`}
    >
      {winner ? (
        <h2>{winner === user.username ? "You Win!" : "You Lose!"}</h2>
      ) : (
        <h2
          className="pb-4 text-white text-2xl font-bold text-center
        "
        >
          {isMyTurn ? "Your Turn" : "Opponent's Turn"}
        </h2>
      )}
      <div className="board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => {
              const isWinningCell = winningCells.some(
                ([winRow, winCol]) => winRow === rowIndex && winCol === colIndex
              );
              return (
                <div
                  key={colIndex}
                  className="col"
                  onClick={() => dropDisc(colIndex)}
                >
                  <div
                    className={`cell ${
                      cell === 1 ? "red" : cell === 2 ? "yellow" : ""
                    } ${isWinningCell ? "winning-cell" : ""}`}
                  ></div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {winner && (
        <button
          onClick={resetGame}
          className="mt-2 bg-red-500 hover:bg-red-800"
        >
          Restart Game
        </button>
      )}
    </div>
  );
};

export default Puissance;

// import { useCallback, useEffect, useState } from "react";
// import io from "socket.io-client";
// import { z } from "zod";
// import { useFormik } from "formik";

// const socket = io("http://localhost:3000", { autoConnect: false });

// const Puissance = () => {
//   const [board, setBoard] = useState(
//     Array(6)
//       .fill(null)
//       .map(() => Array(7).fill(null))
//   );
//   const [currentPlayer, setCurrentPlayer] = useState(1);
//   const [winner, setWinner] = useState(null);
//   const [isGameReady, setIsGameReady] = useState(false);
//   const [isMyTurn, setIsMyTurn] = useState(false);
//   const [roomCode, setRoomCode] = useState("");
//   const [isRoomJoined, setIsRoomJoined] = useState(false);
//   const user = JSON.parse(localStorage.getItem("user"));
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     if (!user || !token) {
//       alert("Please log in to start the game");
//       window.location.href = "/signin";
//     } else {
//       if (!socket.connected) {
//         socket.connect();
//       }

//       socket.on("gameReady", (gameData) => {
//         console.log("Game is ready:", gameData);
//         setIsGameReady(true);
//         setIsMyTurn(gameData.firstPlayer === user.username);
//       });

//       socket.on("opponentMove", ({ board, nextPlayer }) => {
//         console.log(
//           "Opponent move received:",
//           board,
//           "Next player:",
//           nextPlayer
//         );
//         setBoard(board);
//         setCurrentPlayer(nextPlayer);
//         setIsMyTurn(nextPlayer !== currentPlayer);
//       });

//       socket.on("gameWon", (winner) => {
//         console.log("Game won by:", winner);
//         setWinner(winner);
//       });

//       return () => {
//         socket.off("gameReady");
//         socket.off("opponentMove");
//         socket.off("gameWon");
//       };
//     }
//   }, [user, token]);

//   const joinRoom = () => {
//     socket.emit("joinRoom", { username: user.username, roomCode });
//     setIsRoomJoined(true);
//   };

//   const checkWin = (board, player) => {
//     const rows = board.length;
//     const cols = board[0].length;

//     // Check horizontal wins
//     for (let row = 0; row < rows; row++) {
//       for (let col = 0; col < cols - 3; col++) {
//         if (
//           board[row][col] === player &&
//           board[row][col + 1] === player &&
//           board[row][col + 2] === player &&
//           board[row][col + 3] === player
//         ) {
//           return [
//             [row, col],
//             [row, col + 1],
//             [row, col + 2],
//             [row, col + 3],
//           ]; // Return winning cells
//         }
//       }
//     }

//     // Check vertical wins
//     for (let row = 0; row < rows - 3; row++) {
//       for (let col = 0; col < cols; col++) {
//         if (
//           board[row][col] === player &&
//           board[row + 1][col] === player &&
//           board[row + 2][col] === player &&
//           board[row + 3][col] === player
//         ) {
//           return [
//             [row, col],
//             [row + 1, col],
//             [row + 2, col],
//             [row + 3, col],
//           ]; // Return winning cells
//         }
//       }
//     }

//     // Check diagonal wins (left to right)
//     for (let row = 0; row < rows - 3; row++) {
//       for (let col = 0; col < cols - 3; col++) {
//         if (
//           board[row][col] === player &&
//           board[row + 1][col + 1] === player &&
//           board[row + 2][col + 2] === player &&
//           board[row + 3][col + 3] === player
//         ) {
//           return [
//             [row, col],
//             [row + 1, col + 1],
//             [row + 2, col + 2],
//             [row + 3, col + 3],
//           ]; // Return winning cells
//         }
//       }
//     }

//     // Check diagonal wins (right to left)
//     for (let row = 0; row < rows - 3; row++) {
//       for (let col = 3; col < cols; col++) {
//         if (
//           board[row][col] === player &&
//           board[row + 1][col - 1] === player &&
//           board[row + 2][col - 2] === player &&
//           board[row + 3][col - 3] === player
//         ) {
//           return [
//             [row, col],
//             [row + 1, col - 1],
//             [row + 2, col - 2],
//             [row + 3, col - 3],
//           ]; // Return winning cells
//         }
//       }
//     }

//     // No win found
//     return null;
//   };

//   const [winningCells, setWinningCells] = useState([]);

//   const dropDisc = useCallback(
//     (colIndex) => {
//       if (!isMyTurn || winner) return;
//       const rowIndex = board.map((row) => row[colIndex]).lastIndexOf(null);
//       if (rowIndex === -1) return;

//       const newBoard = board.map((row) => [...row]);
//       newBoard[rowIndex][colIndex] = currentPlayer;
//       setBoard(newBoard);

//       // Check if the current player wins and get the winning cells
//       const winningCellsResult = checkWin(newBoard, currentPlayer);
//       if (winningCellsResult) {
//         setWinner(user.username);
//         setWinningCells(winningCellsResult); // Store the winning cells
//         socket.emit("gameWon", { winner: user.username, roomCode });
//       } else {
//         socket.emit("makeMove", {
//           board: newBoard,
//           nextPlayer: currentPlayer === 1 ? 2 : 1,
//           roomCode,
//         });
//         setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
//         setIsMyTurn(false);
//       }
//     },
//     [isMyTurn, winner, board, currentPlayer]
//   );

//   const resetGame = useCallback(() => {
//     setBoard(
//       Array(6)
//         .fill(null)
//         .map(() => Array(7).fill(null))
//     ); // Reset the board
//     setCurrentPlayer(1); // Reset to player 1's turn
//     setWinner(null); // Clear winner
//     setWinningCells([]); // Clear the highlighted winning cells
//     socket.emit("resetGame", roomCode); // Notify the server
//   }, [roomCode]);

//   const formCode = z.object({
//     roomCode: z.string().min(4).max(4),
//   });

//   const formik = useFormik({
//     initialValues: {
//       roomCode: "",
//     },
//     validate: (values) => {
//       try {
//         formCode.parse(values);
//       } catch (error) {
//         const errors = {};
//         error.errors.forEach((err) => {
//           errors[err.path[0]] = err.message;
//         });
//         return errors;
//       }
//     },
//     onSubmit: (values) => {
//       console.log("Room Code", values);
//       setRoomCode(values.roomCode);
//       joinRoom();
//     },
//   });

//   if (!isRoomJoined) {
//     return (
//       <form
//         onSubmit={formik.handleSubmit}
//         className="game-container flex flex-col items-center justify-center  bg-gradient-to-b from-indigo-900 to-purple-900 text-white"
//       >
//         <h1 className="text-4xl font-extrabold mb-6 text-shadow-lg">
//           Enter Room Code
//         </h1>
//         <input
//           type="text"
//           id="roomCode"
//           name="roomCode"
//           className="m-4 p-4 rounded-md h-12 w-80 text-lg border-2 border-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-indigo-50 text-indigo-900"
//           placeholder="Enter room code..."
//           onChange={formik.handleChange}
//           onBlur={formik.handleBlur}
//           value={formik.values.roomCode}
//         />
//         {formik.touched.roomCode && formik.errors.roomCode && (
//           <div className="text-neon-red text-sm mt-2 glitch-text">
//             {formik.errors.roomCode}
//           </div>
//         )}
//         <button
//           type="submit"
//           className="px-6 py-3 mt-4 bg-indigo-600 text-white font-semibold text-lg rounded-lg shadow-md hover:bg-indigo-500 hover:shadow-xl transition-all duration-300"
//         >
//           Join Room
//         </button>
//       </form>
//     );
//   }

//   if (!isGameReady) {
//     return (
//       <div className="game-container flex flex-col items-center justify-center  bg-gradient-to-b from-indigo-900 to-purple-900 text-white">
//         <h2 className="text-2xl font-medium mb-4 animate-pulse">
//           Waiting for another player...
//         </h2>
//         <div className="spinner border-t-4 border-b-4 border-gray-400 w-16 h-16 rounded-full animate-spin"></div>
//         <button
//           onClick={() => {
//             socket.emit("cancelRoom", roomCode);
//             setIsRoomJoined(false);
//           }}
//           className="px-6 py-3 mt-4 bg-indigo-600 text-white font-semibold text-lg rounded-lg shadow-md hover:bg-indigo-500 hover:shadow-xl transition-all duration-300"
//         >
//           Cancel
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div
//       className={`game-container ${isMyTurn ? "your-turn" : "opponent-turn"}`}
//     >
//       <h1 className="text-white">Puissance 4</h1>
//       {winner ? (
//         <h2>{winner === user.username ? "You Win!" : "You Lose!"}</h2>
//       ) : (
//         <h2>{isMyTurn ? "Your Turn" : "Opponent's Turn"}</h2>
//       )}
//       <div className="board">
//         {board.map((row, rowIndex) => (
//           <div key={rowIndex} className="row">
//             {row.map((cell, colIndex) => {
//               const isWinningCell = winningCells.some(
//                 ([winRow, winCol]) => winRow === rowIndex && winCol === colIndex
//               );
//               return (
//                 <div
//                   key={colIndex}
//                   className="col"
//                   onClick={() => dropDisc(colIndex)}
//                 >
//                   <div
//                     className={`cell ${
//                       cell === 1 ? "red" : cell === 2 ? "yellow" : ""
//                     } ${isWinningCell ? "winning-cell" : ""}`}
//                   ></div>
//                 </div>
//               );
//             })}
//           </div>
//         ))}
//       </div>

//       {winner && (
//         <button
//           onClick={resetGame}
//           className="mt-2 bg-red-500 hover:bg-red-800"
//         >
//           Restart Game
//         </button>
//       )}
//     </div>
//   );
// };

// export default Puissance;
