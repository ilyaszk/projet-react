import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const PongGame = () => {
  const canvasRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerSide, setPlayerSide] = useState(null);
  const [scores, setScores] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    // Nettoyage à la déconnexion
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('gameStart', ({ playerPositions }) => {
      setGameStarted(true);
      setPlayerSide(socket.id === playerPositions.left ? 'left' : 'right');
    });

    socket.on('gameState', (gameState) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      drawGame(ctx, gameState);
      setScores(gameState.scores);
    });

    socket.on('gameEnd', ({ winner, scores }) => {
      setGameStarted(false);
      alert(`Game Over! ${winner} side wins with ${scores[winner]} points!`);
    });

    // Gestion des mouvements de la souris
    const handleMouseMove = (e) => {
      if (!gameStarted || !playerSide) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;

      socket.emit('paddleMove', {
        roomId: 'game-room',
        position: mouseY,
        player: playerSide
      });
    };

    const canvas = canvasRef.current;
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [socket, gameStarted, playerSide]);

  const joinGame = () => {
    socket.emit('joinGame', {
      roomId: 'game-room',
      username: 'Player' + Math.floor(Math.random() * 1000)
    });
  };

  const drawGame = (ctx, gameState) => {
    const { ball, paddles } = gameState;

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

    // Afficher les scores
    ctx.font = '32px Arial';
    ctx.fillText(scores.left, 300, 50);
    ctx.fillText(scores.right, 500, 50);
  };

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
        <div className="mb-4 text-white text-xl">
          {scores.left} - {scores.right}
        </div>

        <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border-2 border-white"
        />

        {!gameStarted && (
            <button
                onClick={joinGame}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Join Game
            </button>
        )}

        {gameStarted && (
            <div className="mt-4 text-white">
              You are playing on the {playerSide} side
            </div>
        )}
      </div>
  );
};

export default PongGame;