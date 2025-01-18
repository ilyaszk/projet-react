import React, {useContext, useEffect, useRef, useState} from 'react';
import {io} from 'socket.io-client';
import {GlobalContext} from "../../GlobalContext.jsx";
import {useFormik} from "formik";
import {z} from "zod";
import CustomGameAlert from "./CustomGameAlert.jsx";

const PongGame = () => {
    const {CurrentUser} = useContext(GlobalContext);
    const [userId] = useState(CurrentUser.id);
    console.log("Current user id:", userId);
    const canvasRef = useRef(null);
    const [socket, setSocket] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [playerSide, setPlayerSide] = useState(null);
    const [scores, setScores] = useState({left: 0, right: 0});
    const [rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [gameEnded, setGameEnded] = useState(false);
    const [rematchRequested, setRematchRequested] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertDetails, setAlertDetails] = useState(null);

    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('joinError', ({message}) => {
            alert(message);
        });

        socket.on('roomsList', (roomsList) => {
            setRooms(roomsList);
        });

        socket.on('roomCreated', ({roomId, roomName}) => {
            setCurrentRoom({id: roomId, name: roomName});
            setShowCreateRoom(false);
        });

        socket.on('roomAdded', (room) => {
            setRooms(prev => [...prev, room]);
        });

        socket.on('roomRemoved', ({roomId}) => {
            setRooms(prev => prev.filter(room => room.roomId !== roomId));
        });

        socket.on('playerJoined', ({players}) => {
            // Mettre à jour l'état local avec les infos des joueurs
            const currentPlayer = players.find(p => p.id === socket.id);
            if (currentPlayer) {
                setPlayerSide(currentPlayer.side);
            }
        });

        socket.on('playerLeft', () => {
            if (gameStarted) {
                setGameStarted(false);
                setGameEnded(true);
                setRematchRequested(false);
            }
        });

        socket.on('gameStart', ({gameState}) => {
            setGameStarted(true);
            setGameEnded(false);
            setRematchRequested(false);

            // Initialiser le canvas avec l'état initial
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                drawGame(ctx, gameState);
            }
        });

        socket.on('playerAssigned', ({side}) => {
            setPlayerSide(side);
            console.log('Assigned to side:', side);
        });

        socket.on('gameState', (gameState) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            drawGame(ctx, gameState);
            setScores(gameState.scores);
        });


        socket.on('gameEnd', ({winner, scores, reason}) => {
            setGameStarted(false);
            setGameEnded(true);
            setAlertDetails({winner, scores, reason});
            setShowAlert(true);
        });

        socket.on('rematchRequested', ({playerName}) => {
            // TODO : Afficher une alerte pour demander au joueur s'il veut rejouer
            setRematchRequested(true);
        });

        socket.emit('getRooms');

        const handleMouseMove = (e) => {
            if (!gameStarted || !playerSide || !currentRoom) return;

            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const mouseY = e.clientY - rect.top;

            socket.emit('paddleMove', {
                roomId: currentRoom.id,
                position: mouseY,
                player: playerSide
            });
        };

        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            if (canvas) {
                canvas.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, [socket, gameStarted, playerSide, currentRoom]);

    const createRoom = () => {
        console.log('Joining user:', playerName, 'with userId:', userId);
        if (newRoomName && playerName) {
            socket.emit('createRoom', {roomName: newRoomName, playerName, userId});
        }
    };

    const joinRoom = (roomId) => {
        console.log('Joining user:', playerName, 'to room:', roomId, 'with userId:', userId);
        if (playerName) {
            const room = rooms.find(r => r.roomId === roomId);
            if (room) {
                setCurrentRoom({id: roomId, name: room.roomName});
                socket.emit('joinRoom', {roomId, playerName, userId});
            }
        }
    };

    const requestRematch = () => {
        if (currentRoom) {
            socket.emit('requestRematch', {roomId: currentRoom.id});
            setRematchRequested(true);
        }
    };

    const drawGame = (ctx, gameState) => {
        const {ball, paddles} = gameState;

        // Effacer le canvas
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 800, 600);

        // Dessiner les paddles
        ctx.fillStyle = 'white';
        ctx.fillRect(0, paddles.left.y, 20, 100);
        ctx.fillRect(780, paddles.right.y, 20, 100);

        // Dessiner la balle
        ctx.fillRect(ball.x, ball.y, 10, 10);

        // Dessiner la ligne centrale
        ctx.setLineDash([5, 15]);
        ctx.beginPath();
        ctx.moveTo(400, 0);
        ctx.lineTo(400, 600);
        ctx.strokeStyle = 'white';
        ctx.stroke();

    };
    const [playerNameTemp, setPlayerNameTemp] = useState('');

    const nameSchema = z.object({
        name: z.string().nonempty('Name is required').min(3, 'Name must be at least 3 characters long').max(20, 'Name must be at most 20 characters long')
    });

    const formName = useFormik({
        initialValues: {
            name: '',
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
        console.log('Player name:', name);
        setPlayerName(name);
    }

    // Si le joueur n'a pas encore entré son nom
    if (!playerName) {
        return (
            <form className="flex flex-col items-center justify-center h-full  bg-gray-900 p-4"
                  onSubmit={formName.handleSubmit}>
                <div className="bg-gray-800 p-6 space-x-2 rounded-lg">
                    <input
                        id="name"
                        name="name"
                        type="text"
                        className={` ${
                            formName.touched.name && formName.errors.name
                                ? "border-neon-red"
                                : "border-neon-pink"
                        } px-4 py-2 rounded bg-gray-700 text-white mb-4`}
                        onChange={formName.handleChange}
                        onBlur={formName.handleBlur}
                        value={formName.values.name}
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        valider
                    </button>
                    {formName.touched.name && formName.errors.name && (
                        <div className="text-neon-red text-sm mt-2 glitch-text">
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
            <div className="flex flex-col items-center justify-center  bg-gray-900 p-4">
                <div className="bg-gray-800 p-6 rounded-lg w-96">
                    <h2 className="text-white text-xl mb-4">Welcome {playerName}!</h2>

                    {/* Création de salle */}
                    {showCreateRoom ? (
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Room name"
                                className="px-4 py-2 rounded bg-gray-700 text-white w-full mb-2"
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={createRoom}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Create Room
                                </button>
                                <button
                                    onClick={() => setShowCreateRoom(false)}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowCreateRoom(true)}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-4 w-full"
                        >
                            Create New Room
                        </button>
                    )}

                    {/* Liste des salles */}
                    <div className="border border-gray-700 rounded overflow-hidden">
                        <div className="bg-gray-700 px-4 py-2 text-white font-bold">
                            Available Rooms
                        </div>
                        {rooms.length === 0 ? (
                            <div className="p-4 text-gray-400">No rooms available</div>
                        ) : (
                            <div className="divide-y divide-gray-700">
                                {rooms.map(room => (
                                    <div key={room.roomId} className="p-4 flex justify-between items-center">
                                        <div>
                                            <div className="text-white font-medium">{room.roomName}</div>
                                            <div className="text-gray-400 text-sm">
                                                Players: {room.players.length}/2
                                            </div>
                                        </div>
                                        {room.status === 'waiting' && (
                                            <button
                                                onClick={() => joinRoom(room.roomId)}
                                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
                <div
                    className="absolute inset-0   opacity-30 bg-black grid grid-cols-2"
                >
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

            {gameEnded && !rematchRequested && (
                <button
                    onClick={requestRematch}
                    className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Request Rematch
                </button>
            )}

            {rematchRequested && !gameStarted && (
                <div className="mt-4 text-white text-xl font-bold text-center animate-bounce">
                    Waiting for other player...
                </div>
            )}

            {gameStarted && (
                <div className="mt-4 text-white text-xl font-bold text-center">
                    You are playing on the {playerSide} side
                </div>
            )}
        </div>
    );
};

export default PongGame;