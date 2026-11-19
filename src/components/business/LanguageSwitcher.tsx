import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ButtonBase from '@mui/material/ButtonBase';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { alpha } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';

import { currentLanguage, LANGUAGES } from '../../i18n';
import { colors, fonts, palette } from '../../theme';

/** Compact globe + code button with a menu of languages in their own names. */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const active = currentLanguage();
  const short = LANGUAGES.find((l) => l.code === active)?.short;

  return (
    <>
      <ButtonBase
        aria-label={t('language.label')}
        aria-haspopup="menu"
        aria-expanded={anchor ? 'true' : undefined}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          px: 1,
          py: '5px',
          borderRadius: '4px',
          border: `1px solid ${colors.border}`,
          bgcolor: colors.surfaceContainerLow,
          color: colors.textSecondary,
          fontFamily: fonts.mono,
          fontWeight: 500,
          fontSize: 10,
          lineHeight: '12px',
          letterSpacing: '0.6px',
          transition: 'border-color 150ms, color 150ms',
          '&:hover': {
            color: colors.text,
            borderColor: alpha(palette.primary.base, 0.3),
          },
          '&.Mui-focusVisible': {
            outline: `2px solid ${alpha(palette.primary.base, 0.5)}`,
          },
        }}
      >
        <LanguageOutlinedIcon sx={{ fontSize: 14 }} />
        {short}
      </ButtonBase>

      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {LANGUAGES.map((l) => (
          <MenuItem
            key={l.code}
            lang={l.code}
            selected={l.code === active}
            onClick={() => {
              setAnchor(null);
              void i18n.changeLanguage(l.code);
            }}
          >
            <ListItemText>{l.name}</ListItemText>
            <ListItemIcon sx={{ justifyContent: 'flex-end' }}>
              {l.code === active && <CheckIcon fontSize="small" />}
            </ListItemIcon>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
