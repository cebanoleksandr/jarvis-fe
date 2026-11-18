import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/** Temporary body for screens that are not built yet. */
export function PagePlaceholder({
  title,
  note,
}: {
  title: string;
  note?: string;
}) {
  return (
    <Box sx={{ height: '100%', overflowY: 'auto', p: { xs: 2, sm: 4 } }}>
      <Typography variant="h3" component="h1">
        {title}
      </Typography>
      {note && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {note}
        </Typography>
      )}
    </Box>
  );
}
