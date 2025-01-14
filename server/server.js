require('dotenv').config();
const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Chess } = require("chess.js");
const Game = require("./models/Game");

const app = express();
const server = http.createServer(app);

// CORS middleware
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chess_app')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Socket.IO setup 
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Your Vite client URL
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["*"]
    },
    transports: ['websocket', 'polling'] // Enable both WebSocket and polling
});

// Game state
const games = new Map();
const players = new Map();

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinGame", async (gameId) => {
        let game = games.get(gameId);

        if (!game) {

            const existingGame = await Game.findOne({ gameId })
            console.log(existingGame)

            if (!existingGame) {
                // Create new game instance
                console.log("New game creating")
                game = {
                    chess: new Chess(),
                    players: { white: null, black: null },
                    spectators: new Set()
                };
                games.set(gameId, game);

                // Save initial game state to MongoDB
                try {
                    await Game.create({
                        gameId,
                        fen: game.chess.fen(),
                        status: 'waiting'
                    });
                } catch (err) {
                    console.error('Error creating game:', err);
                }
            } else {
                game = {
                    chess: new Chess(existingGame.fen), // Load the existing FEN
                    players: existingGame.players,
                    spectators: new Set()
                };
                games.set(gameId, game);
            }
        }

        if (!game.players.white) {
            game.players.white = socket.id;
            players.set(socket.id, { gameId, color: 'w' });
            socket.emit("playerRole", "w");
            // Notify the other player (if exists)
            if (game.players.black) {
                io.to(game.players.black).emit("playerRole", "b");
            }
        } else if (!game.players.black) {
            game.players.black = socket.id;
            players.set(socket.id, { gameId, color: 'b' });
            socket.emit("playerRole", "b");
            // Notify the other player (if exists)
            if (game.players.white) {
                io.to(game.players.white).emit("playerRole", "w");
            }

            // Update game status to active when both players join
            try {
                await Game.findOneAndUpdate(
                    { gameId },
                    {
                        status: 'active',
                        'players.white': game.players.white,
                        'players.black': game.players.black
                    }
                );
            } catch (err) {
                console.error('Error updating game status:', err);
            }
        } else {
            game.spectators.add(socket.id);
            players.set(socket.id, { gameId, color: 'spectator' });
            socket.emit("spectatorRole");
        }

        socket.join(gameId);
        io.to(gameId).emit("gameState", game.chess.fen());
    });

    socket.on("move", async ({ gameId, move }) => {
        const game = games.get(gameId);
        const player = players.get(socket.id);

        if (!game || !player) return;

        try {
            if (game.chess.turn() !== player.color) return;

            const result = game.chess.move(move);
            if (result) {
                io.to(gameId).emit("move", move);
                io.to(gameId).emit("gameState", game.chess.fen());

                // Save move to MongoDB
                try {
                    await Game.findOneAndUpdate(
                        { gameId },
                        {
                            $push: { moves: move },
                            fen: game.chess.fen()
                        }
                    );
                } catch (err) {
                    console.error('Error saving move:', err);
                }
            }
        } catch (err) {
            console.error(err);
            socket.emit("invalidMove", move);
        }
    });

    socket.on("disconnect", () => {
        const player = players.get(socket.id);
        if (player) {
            const game = games.get(player.gameId);
            if (game) {
                if (game.players.white === socket.id) game.players.white = null;
                if (game.players.black === socket.id) game.players.black = null;
                game.spectators.delete(socket.id);
            }
            players.delete(socket.id);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});