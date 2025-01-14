import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import ChessIcon from '@mui/icons-material/Casino';

const Navbar = () => {
  return (
    <AppBar position="static" sx={{ bgcolor: 'background.paper' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ChessIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div">
            64Squares
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Button color="primary" variant="contained" sx={{ mr: 2 }}>
          New Game
        </Button>
        <Button color="inherit">
          Rules
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;