import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { Chess } from 'chess.js';
import { io } from 'socket.io-client';
import Square from './Square';
import GameInfo from './GameInfo';

const GameBoard = () => {
  const [chess] = useState(new Chess());
  const [playerColor, setPlayerColor] = useState('w');
  const [boardKey, setBoardKey] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Socket.IO connection with error handling
    const newSocket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Connected to server');
      // Join a game when connected
      newSocket.emit('joinGame', 'game-1'); // You can generate a unique game ID
    });

    newSocket.on('playerRole', (color) => {
      console.log('Assigned color:', color);
      setPlayerColor(color);
    });

    newSocket.on('move', (move) => {
      chess.move(move);
      setBoardKey(prev => prev + 1);
    });

    setSocket(newSocket);

    // Cleanup on component unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  const handleDragStart = (e, row, col) => {
    if (chess.turn() === playerColor) {
      const piece = chess.board()[row][col];
      if (piece && piece.color === playerColor) {
        e.dataTransfer.setData('text/plain', JSON.stringify({ row, col }));
      }
    }
  };

  const handleDrop = (e, targetRow, targetCol) => {
    e.preventDefault();
    const sourceSquare = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    if (sourceSquare) {
      const move = {
        from: `${String.fromCharCode(97 + sourceSquare.col)}${8 - sourceSquare.row}`,
        to: `${String.fromCharCode(97 + targetCol)}${8 - targetRow}`,
      };

      try {
        const result = chess.move(move);
        if (result) {
          socket?.emit('move', { gameId: 'game-1', move });
          setBoardKey(prev => prev + 1);
        }
      } catch (err) {
        console.error('Invalid move:', err);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 4, alignItems: 'start', width: '100%', justifyContent: 'center' }}>
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 1,
          p: 2,
          minWidth: 600,
          boxShadow: 3,
        }}
        className={`board ${playerColor === 'b' ? 'flipped' : ''}`}
      >
        <Box 
          key={boardKey}
          sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            aspectRatio: '1/1',
            width: '100%'
          }}
        >
          {chess.board().map((row, rowIndex) =>
            row.map((piece, colIndex) => (
              <Square
                key={`${rowIndex}-${colIndex}`}
                piece={piece}
                isLight={(rowIndex + colIndex) % 2 === 0}
                onDragStart={(e) => handleDragStart(e, rowIndex, colIndex)}
                onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                isDraggable={piece?.color === playerColor}
              />
            ))
          )}
        </Box>
      </Box>
      <GameInfo 
        playerColor={playerColor} 
        isYourTurn={chess.turn() === playerColor}
      />
    </Box>
  );
};

export default GameBoard;