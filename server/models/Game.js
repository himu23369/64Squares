const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    gameId: {
        type: String,
        required: true,
        unique: true
    },
    players: {
        white: { 
            type: String, 
            default: null 
        },
        black: { 
            type: String, 
            default: null 
        }
    },
    fen: {
        type: String,
        required: true,
        default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    },
    moves: [{
        from: String,
        to: String
    }],
    status: {
        type: String,
        enum: ['waiting', 'active', 'completed'],
        default: 'waiting'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;