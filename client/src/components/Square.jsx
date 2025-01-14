import { Box } from '@mui/material'

const Square = ({ piece, isLight, onDragStart, onDrop, isDraggable }) => {
  return (
    <Box
      sx={{
        bgcolor: isLight ? '#f0d9b5' : '#b58863',
        '&:hover': {
          bgcolor: isLight ? '#f5e0c0' : '#c09470',
        },
        transition: 'background-color 0.2s',
        aspectRatio: '1/1',
        position: 'relative',
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {piece && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            cursor: isDraggable ? 'grab' : 'not-allowed',
            userSelect: 'none',
            color: piece.color === 'w' ? '#fff' : '#000',
            textShadow: piece.color === 'w' ? '0 0 2px #000' : '0 0 2px #fff',
          }}
          draggable={isDraggable}
          onDragStart={onDragStart}
          className={`piece ${piece.color === 'w' ? 'white' : 'black'}`}
        >
          {getPieceUnicode(piece)}
        </Box>
      )}
    </Box>
  )
}

const getPieceUnicode = (piece) => {
  const unicodePieces = {
    'w': {
      'p': '♙', 'n': '♘', 'b': '♗', 
      'r': '♖', 'q': '♕', 'k': '♔'
    },
    'b': {
      'p': '♟', 'n': '♞', 'b': '♝', 
      'r': '♜', 'q': '♛', 'k': '♚'
    }
  }
  return unicodePieces[piece.color][piece.type]
}

export default Square