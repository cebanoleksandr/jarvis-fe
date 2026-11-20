import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

import { colors, fonts } from '../../theme';

/**
 * Assistant text. Raw HTML in the model output is not rendered (react-markdown
 * escapes it), which also keeps injected content from emails or docs inert.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <Box
      sx={{
        fontSize: 14,
        lineHeight: '22.75px',
        color: colors.text,
        overflowWrap: 'anywhere',
        '& > :first-of-type': { mt: 0 },
        '& > :last-child': { mb: 0 },
        '& p': { my: 1 },
        '& ul, & ol': { my: 1, pl: 3 },
        // Tailwind's preflight strips list markers.
        '& ul': { listStyle: 'disc' },
        '& ol': { listStyle: 'decimal' },
        '& li': { my: 0.25 },
        '& strong': { fontWeight: 600, color: colors.textStrong },
        '& h1, & h2, & h3, & h4': {
          mt: 2,
          mb: 1,
          fontWeight: 600,
          lineHeight: 1.35,
          color: colors.textStrong,
        },
        '& h1': { fontSize: 18 },
        '& h2': { fontSize: 16 },
        '& h3, & h4': { fontSize: 14 },
        '& a': {
          color: colors.accentText,
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline' },
        },
        '& code': {
          fontFamily: fonts.mono,
          fontSize: 12,
          px: '5px',
          py: '1px',
          borderRadius: '4px',
          bgcolor: colors.surfaceContainerHigh,
        },
        '& pre': {
          my: 1.5,
          p: 1.5,
          overflowX: 'auto',
          borderRadius: '8px',
          bgcolor: alpha(colors.background, 0.8),
          border: `1px solid ${alpha(colors.outline, 0.3)}`,
          '& code': { p: 0, bgcolor: 'transparent' },
        },
        '& blockquote': {
          m: 0,
          my: 1,
          pl: 1.5,
          borderLeft: `2px solid ${alpha(colors.accentText, 0.4)}`,
          color: colors.textSecondary,
        },
        '& table': {
          my: 1.5,
          borderCollapse: 'collapse',
          display: 'block',
          overflowX: 'auto',
          fontSize: 13,
        },
        '& th, & td': {
          px: 1.25,
          py: 0.75,
          border: `1px solid ${alpha(colors.outline, 0.4)}`,
          textAlign: 'left',
        },
        '& th': { bgcolor: colors.surfaceContainer, fontWeight: 600 },
        '& hr': {
          my: 2,
          border: 0,
          borderTop: `1px solid ${alpha(colors.outline, 0.3)}`,
        },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </Box>
  );
}
