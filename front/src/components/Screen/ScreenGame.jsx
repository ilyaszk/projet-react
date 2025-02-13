import { useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { GlobalContext } from "../../GlobalContext.jsx";
import { useFormik } from "formik";
import { z } from "zod";
import CustomGameAlert from "./CustomGameAlert.jsx";
import { useNavigate } from "react-router-dom";

const PongGame = () => {
  const { CurrentUser } = useContext(GlobalContext);
  const [userId] = useState(CurrentUser.id);
  const canvasRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerSide, setPlayerSide] = useState(null);
  const [scores, setScores] = useState({ left: 0, right: 0 });
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertDetails, setAlertDetails] = useState(null);
  useEffect(() => {
    // const newSocket = io("http://localhost:3000");
    const newSocket = io("https://projet-react-memg.onrender.com");
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("joinError", ({ message }) => {
      alert(message);
    });

    socket.on("roomsList", (roomsList) => {
      setRooms(roomsList);
    });

    socket.on("roomCreated", ({ roomId, roomName }) => {
      setCurrentRoom({ id: roomId, name: roomName });
      setShowCreateRoom(false);
    });

    socket.on("roomAdded", (room) => {
      setRooms((prev) => [...prev, room]);
    });

    socket.on("roomRemoved", ({ roomId }) => {
      setRooms((prev) => prev.filter((room) => room.roomId !== roomId));
    });

    socket.on("playerJoined", ({ players }) => {
      // Mettre à jour l'état local avec les infos des joueurs
      const currentPlayer = players.find((p) => p.id === socket.id);
      if (currentPlayer) {
        setPlayerSide(currentPlayer.side);
      }
    });

    socket.on("playerLeft", () => {
      if (gameStarted) {
        setGameStarted(false);
        setAlertDetails({
          winner: playerSide === "left" ? "right" : "left",
          scores,
          reason: "Player left the game",
        });
      }
    });

    socket.on("gameStart", ({ gameState }) => {
      setGameStarted(true);
      // Initialiser le canvas avec l'état initial
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        drawGame(ctx, gameState);
      }
    });

    socket.on("playerAssigned", ({ side }) => {
      setPlayerSide(side);
    });

    socket.on("gameState", (gameState) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      drawGame(ctx, gameState);
      setScores(gameState.scores);
    });

    socket.on("gameEnd", ({ winner, scores, reason }) => {
      setGameStarted(false);
      setAlertDetails({ winner, scores, reason });
      setShowAlert(true);
    });

    socket.emit("getRooms");

    const handleMouseMove = (e) => {
      if (!gameStarted || !playerSide || !currentRoom) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;

      socket.emit("paddleMove", {
        roomId: currentRoom.id,
        position: mouseY,
        player: playerSide,
      });
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [socket, gameStarted, playerSide, currentRoom]);

  const createRoom = () => {
    if (newRoomName && playerName) {
      socket.emit("createRoom", { roomName: newRoomName, playerName, userId });
    }
  };

  const joinRoom = (roomId) => {
    if (playerName) {
      const room = rooms.find((r) => r.roomId === roomId);
      if (room) {
        setCurrentRoom({ id: roomId, name: room.roomName });
        socket.emit("joinRoom", { roomId, playerName, userId });
      }
    }
  };

  const drawGame = (ctx, gameState) => {
    const { ball, paddles } = gameState;

    // Effacer le canvas
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 800, 600);

    // Dessiner les paddles
    ctx.fillStyle = "white";
    ctx.fillRect(0, paddles.left.y, 20, 100);
    ctx.fillRect(780, paddles.right.y, 20, 100);

    // Dessiner la balle
    ctx.fillRect(ball.x, ball.y, 10, 10);

    // Dessiner la ligne centrale
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(400, 0);
    ctx.lineTo(400, 600);
    ctx.strokeStyle = "white";
    ctx.stroke();
  };
  // eslint-disable-next-line no-unused-vars
  const [playerNameTemp, setPlayerNameTemp] = useState("");

  const nameSchema = z.object({
    name: z
      .string()
      .nonempty("Name is required")
      .min(3, "Name must be at least 3 characters long")
      .max(20, "Name must be at most 20 characters long"),
  });

  const formName = useFormik({
    initialValues: {
      name: "",
    },
    onSubmit: (values) => {
      handlePlayerNameChange(values.name);
    },
    validate: (values) => {
      try {
        // Parse the values using the Zod schema
        nameSchema.parse(values);
      } catch (error) {
        const errors = {};
        error.errors.forEach((err) => {
          errors[err.path[0]] = err.message;
        });
        return errors;
      }
    },
  });

  function handlePlayerNameChange(name) {
    setPlayerName(name);
  }

  // Si le joueur n'a pas encore entré son nom
  if (!playerName) {
    return (
      <form
        className="flex flex-col items-center justify-center h-full"
        onSubmit={formName.handleSubmit}
      >
        <div
          className="backdrop-blur-sm p-8 rounded-2xl border-2 shadow-lg space-y-4
          dark:bg-gradient-to-br dark:from-gray-800/50 dark:to-gray-900/50 dark:border-cyan-400 
          bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-yellow-400"
        >
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your name"
            className={`px-4 py-2 rounded-lg w-full transition-all duration-300
              ${
                formName.touched.name && formName.errors.name
                  ? "dark:border-red-500 border-red-500"
                  : "dark:border-cyan-400 border-yellow-400"
              } dark:bg-gray-700 bg-gray-100 dark:text-white text-gray-900
              focus:ring-2 focus:ring-opacity-50 dark:focus:ring-cyan-400 focus:ring-yellow-400`}
            onChange={formName.handleChange}
            onBlur={formName.handleBlur}
            value={formName.values.name}
          />

          <button
            type="submit"
            className="w-full px-6 py-2 rounded-full font-bold shadow-lg transition-all duration-300 hover:scale-105 
              dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-500
              bg-gradient-to-r from-yellow-400 to-yellow-600"
          >
            Valider
          </button>

          {formName.touched.name && formName.errors.name && (
            <div className="text-red-500 text-sm text-center">
              {formName.errors.name}
            </div>
          )}
        </div>
      </form>
    );
  }

  // Lobby principal
  if (!currentRoom) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        {/* btn pour retourner changer son nom */}
        <button
          onClick={() => setPlayerName("")}
          className="px-6 py-2 mb-4 rounded-full font-bold shadow-lg
            dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-500
            bg-gradient-to-r from-yellow-400 to-yellow-600
            transition-all duration-300 hover:scale-105"
        >
          🔙 Change Name
        </button>
        <div
          className="backdrop-blur-sm p-8 rounded-2xl border-2 shadow-lg w-96
          dark:bg-gradient-to-br dark:from-gray-800/50 dark:to-gray-900/50 dark:border-cyan-400 
          bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-yellow-400"
        >
          <h2
            className="text-3xl font-bold mb-6
            dark:text-cyan-400 text-yellow-400"
          >
            Welcome {playerName}!
          </h2>

          {showCreateRoom ? (
            <div className="space-y-4  mb-4">
              <input
                type="text"
                placeholder="Room name"
                className="px-4 py-2 rounded-lg w-full 
                  dark:bg-gray-700 bg-gray-100 
                  dark:text-white text-gray-900
                  dark:border-cyan-400 border-yellow-400
                  focus:ring-2 focus:ring-opacity-50 
                  dark:focus:ring-cyan-400 focus:ring-yellow-400
                  transition-all duration-300"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
              <div className="flex gap-4">
                <button
                  onClick={createRoom}
                  className="px-6 py-2 rounded-full font-bold shadow-lg flex-1
                    dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-500
                    bg-gradient-to-r from-yellow-400 to-yellow-600
                    transition-all duration-300 hover:scale-105"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateRoom(false)}
                  className="px-6 py-2 rounded-full font-bold shadow-lg flex-1
                    dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-700 
                    bg-gradient-to-r from-gray-700 to-gray-600
                    transition-all duration-300 hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreateRoom(true)}
              className="w-full px-6 py-2 rounded-full font-bold shadow-lg mb-6
                dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-500
                bg-gradient-to-r from-yellow-400 to-yellow-600
                transition-all duration-300 hover:scale-105"
            >
              Create New Room
            </button>
          )}

          {/* Room List */}
          <div
            className="border rounded-xl overflow-hidden
            dark:border-cyan-400/30 border-yellow-400/30"
          >
            <div className="dark:bg-cyan-400/10 bg-yellow-400/10 p-4 font-bold">
              Available Rooms
            </div>
            {rooms.length === 0 ? (
              <div className="p-4 text-gray-400">No rooms available</div>
            ) : (
              <div className="divide-y dark:divide-cyan-400/10 divide-yellow-400/10 bg-yellow-200/10 dark:bg-cyan-200/10">
                {rooms.map((room) => (
                  <div
                    key={room.roomId}
                    className="p-4 flex justify-between items-center
                      hover:dark:bg-cyan-400/5 hover:bg-yellow-400/5"
                  >
                    <div>
                      <div className="font-medium">{room.roomName}</div>
                      <div className="text-sm ">
                        Players: {room.players.length}/2
                      </div>
                    </div>
                    {room.status === "waiting" && (
                      <button
                        onClick={() => joinRoom(room.roomId)}
                        className="px-6 py-2 rounded-full font-bold shadow-lg
                          dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-500
                          bg-gradient-to-r from-yellow-400 to-yellow-600
                          transition-all duration-300 hover:scale-105"
                      >
                        Join
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Interface de jeu
  return (
    <div className="flex flex-col items-center justify-center  bg-gray-900 p-4">
      {/* back to lobby */}
      <button
        onClick={() => {
          setCurrentRoom(null);
        }}
        className="px-6 py-2 mb-4 rounded-full font-bold shadow-lg
              dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-500
              bg-gradient-to-r from-yellow-400 to-yellow-600
              transition-all duration-300 hover:scale-105"
      >
        🔙 Back to Lobby
      </button>

      {showAlert && (
        <CustomGameAlert
          {...alertDetails}
          onClose={() => setShowAlert(false)}
        />
      )}
      <div className="mb-4 text-white text-xl font-bold text-center">
        Room: {currentRoom.name} | {scores.left} - {scores.right}
      </div>

      <div className="relative w-[800px] h-[600px]">
        <div className="absolute inset-0   opacity-30 bg-black grid grid-cols-2">
          <h2 className="text-white text-9xl font-bold text-center self-center">
            L
          </h2>
          <h2 className="text-white text-9xl font-bold text-center self-center">
            R
          </h2>
        </div>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="relative z-10 border-2 border-white  opacity-60"
        />
      </div>

      {gameStarted && (
        <div className="mt-4 text-white text-xl font-bold text-center">
          You are playing on the {playerSide} side
        </div>
      )}
    </div>
  );
};

export default PongGame;
