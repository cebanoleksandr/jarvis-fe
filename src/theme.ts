import { alpha, createTheme } from '@mui/material/styles';

/**
 * Design tokens from the Jarvis style board (Figma).
 * Tonal scales go from 0 (black) to 100 (white); `base` is the brand swatch.
 */
export const palette = {
  primary: {
    base: '#22D3EE',
    0: '#000000',
    10: '#001F25',
    20: '#00363E',
    30: '#004F59',
    40: '#006874',
    50: '#00838F',
    60: '#00A0AF',
    70: '#22D3EE',
    80: '#8BEBFF',
    90: '#D3F7FF',
    100: '#FFFFFF',
  },
  secondary: {
    base: '#F59E0B',
    0: '#000000',
    10: '#2A1700',
    20: '#462A00',
    30: '#653E00',
    40: '#855300',
    50: '#A76900',
    60: '#CA8000',
    70: '#F59E0B',
    80: '#FFB95C',
    90: '#FFDDB7',
    100: '#FFFFFF',
  },
  tertiary: {
    base: '#FFB13B',
    0: '#000000',
    10: '#2A1800',
    20: '#452B00',
    30: '#633F00',
    40: '#835400',
    50: '#A46A00',
    60: '#C68100',
    70: '#E99A1F',
    80: '#FFB13B',
    90: '#FFDDB4',
    100: '#FFFFFF',
  },
  neutral: {
    base: '#0A0E14',
    0: '#000000',
    5: '#0A0E14',
    10: '#191C20',
    20: '#2E3036',
    30: '#45474D',
    40: '#5D5E64',
    50: '#76777D',
    60: '#909097',
    70: '#ABABB1',
    80: '#C6C6CC',
    90: '#E2E2E9',
    100: '#FFFFFF',
  },
  error: {
    main: '#FFB4AB',
    container: '#93000A',
    on: '#690005',
  },
} as const;

/** Semantic colors: use these in components, not the raw scales. */
export const colors = {
  /** Page background. */
  background: palette.neutral.base,
  /** Cards and panels, from lowest to highest elevation (values from Figma). */
  surface: '#10141A',
  surfaceContainerLow: '#181C22',
  surfaceContainer: '#1C2026',
  surfaceContainerHigh: '#262A31',
  /** Hairlines: the Figma outline color #3C494C at various opacities. */
  outline: '#3C494C',
  border: alpha('#3C494C', 0.3),
  borderStrong: alpha('#3C494C', 0.6),
  /** Glass panel edge. */
  borderGlass: alpha('#FFFFFF', 0.08),

  /** Headings. */
  textStrong: '#E6EDF3',
  /** Body text. */
  text: '#DFE2EB',
  /** Secondary text, labels, inactive nav. */
  textSecondary: '#BBC9CD',
  textMuted: '#8B98A9',
  /** Cyan used for active nav, links and accent text. */
  accentText: palette.primary[80],
  success: '#34D399',
  /** Text on top of bright fills (primary, secondary, tertiary, inverted). */
  textOnAccent: palette.neutral[10],

  accent: palette.primary.base,
  /** Warnings and actions waiting for confirmation. */
  warning: palette.secondary.base,
  tertiary: palette.tertiary.base,
  error: palette.error.main,
  inverted: palette.neutral[90],
} as const;

export const fonts = {
  sans: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
} as const;

export const radius = {
  /** Buttons, inputs, chips. */
  sm: 6,
  /** Cards and panels. */
  md: 12,
  /** Floating bars, pills. */
  lg: 16,
  full: 9999,
} as const;

declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary'];
    neutral: Palette['primary'];
  }
  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
    neutral?: PaletteOptions['primary'];
  }
  interface TypeBackground {
    surface: string;
    surfaceHigh: string;
  }
  interface TypographyVariants {
    mono: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    mono?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    mono: true;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    tertiary: true;
    neutral: true;
  }
}

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: palette.primary.base,
      light: palette.primary[80],
      dark: palette.primary[60],
      contrastText: colors.textOnAccent,
    },
    secondary: {
      main: palette.secondary.base,
      light: palette.secondary[80],
      dark: palette.secondary[60],
      contrastText: colors.textOnAccent,
    },
    tertiary: {
      main: palette.tertiary.base,
      light: palette.tertiary[90],
      dark: palette.tertiary[70],
      contrastText: colors.textOnAccent,
    },
    neutral: {
      main: palette.neutral[90],
      light: palette.neutral[100],
      dark: palette.neutral[80],
      contrastText: colors.textOnAccent,
    },
    warning: {
      main: palette.secondary.base,
      contrastText: colors.textOnAccent,
    },
    error: {
      main: palette.error.main,
      dark: palette.error.container,
      contrastText: palette.error.on,
    },
    background: {
      default: colors.background,
      paper: colors.surfaceContainer,
      surface: colors.surface,
      surfaceHigh: colors.surfaceContainerHigh,
    },
    text: {
      primary: colors.text,
      secondary: colors.textSecondary,
    },
    divider: colors.border,
  },

  shape: { borderRadius: radius.md },

  typography: {
    fontFamily: fonts.sans,
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.25,
      letterSpacing: '-0.015em',
    },
    h3: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.3 },
    h4: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.35 },
    h5: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4 },
    h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.55 },
    // Labels, times and tool names are set in JetBrains Mono.
    button: {
      fontFamily: fonts.mono,
      fontWeight: 500,
      fontSize: '0.875rem',
      textTransform: 'none',
    },
    caption: { fontFamily: fonts.mono, fontSize: '0.75rem', lineHeight: 1.4 },
    overline: {
      fontFamily: fonts.mono,
      fontSize: '0.6875rem',
      fontWeight: 600,
      letterSpacing: '0.08em',
    },
    mono: { fontFamily: fonts.mono, fontSize: '0.8125rem', lineHeight: 1.5 },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: colors.background, color: colors.text },
      },
    },
    MuiTypography: {
      defaultProps: { variantMapping: { mono: 'span' } },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${colors.border}`,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: radius.sm, paddingInline: 16 },
        outlined: { borderColor: palette.neutral[60], color: colors.text },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { borderRadius: radius.sm } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          backgroundColor: colors.surfaceContainerHigh,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.borderStrong,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.neutral[50],
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 6,
          borderRadius: radius.full,
          backgroundColor: palette.neutral[20],
        },
        bar: { borderRadius: radius.full },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: radius.sm, fontFamily: fonts.mono },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.surfaceContainerHigh,
          border: `1px solid ${colors.border}`,
          fontFamily: fonts.mono,
        },
      },
    },
  },
});
