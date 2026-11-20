import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import { alpha } from '@mui/material/styles';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import StopIcon from '@mui/icons-material/Stop';

import { colors, fonts, palette, radius } from '../../theme';

const CYAN = palette.primary.base;

interface ChatComposerProps {
  onSend: (text: string) => void;
  /** A reply is streaming: show Stop instead of Send. */
  streaming?: boolean;
  onStop?: () => void;
  /** Blocks sending (e.g. while a conversation is being created). */
  disabled?: boolean;
  autoFocus?: boolean;
}

/** Glass prompt box pinned under the conversation. Enter sends, Shift+Enter adds a line. */
export function ChatComposer({
  onSend,
  streaming = false,
  onStop,
  disabled = false,
  autoFocus = false,
}: ChatComposerProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const canSend = !disabled && !streaming && text.trim().length > 0;

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!canSend) return;
    onSend(text.trim());
    setText('');
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        px: { xs: 2, sm: 3 },
        pb: 2,
        // Fade the messages out under the composer.
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: '100%',
          height: 48,
          pointerEvents: 'none',
          background: `linear-gradient(to top, ${colors.surface}, ${alpha(colors.surface, 0)})`,
        },
      }}
    >
      <Box sx={{ maxWidth: 760, mx: 'auto' }}>
        <Box
          component="form"
          onSubmit={submit}
          sx={{
            p: '11px',
            borderRadius: `${radius.md}px`,
            bgcolor: alpha(colors.surfaceContainerLow, 0.9),
            backdropFilter: 'blur(24px)',
            border: `1px solid ${alpha(colors.outline, 0.4)}`,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            transition: 'border-color 150ms',
            '&:focus-within': { borderColor: alpha(CYAN, 0.4) },
          }}
        >
          <InputBase
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('chat.placeholder')}
            multiline
            maxRows={8}
            autoFocus={autoFocus}
            fullWidth
            inputProps={{ 'aria-label': t('chat.placeholder') }}
            sx={{
              px: 1,
              pt: '7px',
              fontSize: 14,
              lineHeight: '22px',
              color: colors.text,
              '& textarea::placeholder': {
                color: alpha(colors.textSecondary, 0.5),
                opacity: 1,
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
            {streaming ? (
              <IconButton
                aria-label={t('chat.stop')}
                onClick={onStop}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  bgcolor: colors.surfaceContainerHigh,
                  color: colors.text,
                  border: `1px solid ${alpha(colors.outline, 0.6)}`,
                  '&:hover': { bgcolor: colors.surfaceContainer },
                }}
              >
                <StopIcon sx={{ fontSize: 16 }} />
              </IconButton>
            ) : (
              <IconButton
                type="submit"
                aria-label={t('chat.send')}
                disabled={!canSend}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  bgcolor: CYAN,
                  color: colors.textOnAccent,
                  boxShadow: `0 0 16px -2px ${alpha(CYAN, 0.25)}`,
                  '&:hover': { bgcolor: colors.accentText },
                  '&.Mui-disabled': {
                    bgcolor: alpha(CYAN, 0.25),
                    color: alpha(colors.textOnAccent, 0.6),
                    boxShadow: 'none',
                  },
                }}
              >
                <ArrowUpwardIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>
        </Box>
        <Box
          component="p"
          sx={{
            m: 0,
            pt: '8.5px',
            textAlign: 'center',
            fontFamily: fonts.mono,
            fontWeight: 500,
            fontSize: 10,
            lineHeight: '12px',
            letterSpacing: '0.6px',
            color: alpha(colors.textSecondary, 0.6),
          }}
        >
          {t('chat.disclaimer')}
        </Box>
      </Box>
    </Box>
  );
}
