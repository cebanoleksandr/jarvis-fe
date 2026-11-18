import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { authService } from '../services';

/** Minimal sign-in; the full Figma card (orb, scopes list) comes with the login screen task. */
export default function LoginPage() {
  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h2" component="h1" sx={{ fontSize: 28 }}>
        Your personal assistant
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        Plans your goals, manages your calendar and tasks.
      </Typography>
      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={authService.loginWithGoogle}
      >
        Continue with Google
      </Button>
    </Paper>
  );
}
