import Box from '@mui/material/Box';

interface StatusDotProps {
  color: string;
  size?: number;
  /** Soft halo in the same color, as on live indicators. */
  glow?: boolean;
}

export function StatusDot({ color, size = 6, glow = false }: StatusDotProps) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: color,
        boxShadow: glow ? `0 0 8px ${color}` : 'none',
      }}
    />
  );
}
