import { Box, Typography, Chip, Paper } from '@mui/material';

const GameInfo = ({ playerColor, isYourTurn }) => {
  return (
    <Paper sx={{ p: 3, width: 300, bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography color="text.secondary" variant="body2">
            You are playing as
          </Typography>
          <Chip
            label={playerColor === 'w' ? 'White' : 'Black'}
            color={playerColor === 'w' ? 'default' : 'primary'}
            sx={{ mt: 1 }}
          />
        </Box>
        <Box>
          <Typography color="text.secondary" variant="body2">
            Status
          </Typography>
          <Typography color={isYourTurn ? 'success.main' : 'error.main'} sx={{ fontWeight: 'bold', mt: 1 }}>
            {isYourTurn ? 'Your turn' : "Opponent's turn"}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default GameInfo;