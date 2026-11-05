import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Box className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">
          React + Vite + Tailwind + MUI
        </h1>

        <div className="flex flex-col gap-4">
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
          />

          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
          />

          <Button variant="contained" fullWidth>
            Login
          </Button>
        </div>
      </Box>
    </div>
  );
}

export default App;
