import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { useLogout } from '../../queries';
import { colors } from '../../theme';
import BasePopup from './BasePopup';

interface LogoutPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

/** Asks before ending the session; logs out only on explicit confirmation. */
export default function LogoutPopup({ isVisible, onClose }: LogoutPopupProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const logout = useLogout();

  const confirm = () =>
    logout.mutate(undefined, {
      // The session cookie is cleared even if the request failed, so leave either way.
      onSettled: () => {
        onClose();
        navigate('/login', { replace: true });
      },
    });

  return (
    <BasePopup
      isVisible={isVisible}
      // Do not close mid-request: the user would land on /login anyway.
      onClose={() => !logout.isPending && onClose()}
    >
      <Box
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        aria-describedby="logout-text"
        sx={{ p: 1 }}
      >
        <Box
          component="h2"
          id="logout-title"
          sx={{
            m: 0,
            fontWeight: 600,
            fontSize: 18,
            lineHeight: '26px',
            letterSpacing: '-0.45px',
            color: colors.textStrong,
          }}
        >
          {t('logoutDialog.title')}
        </Box>
        <Box
          component="p"
          id="logout-text"
          sx={{
            m: 0,
            mt: 1,
            fontSize: 14,
            lineHeight: '22px',
            color: colors.textSecondary,
          }}
        >
          {t('logoutDialog.text')}
        </Box>

        <Box
          sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={logout.isPending}
            autoFocus
          >
            {t('logoutDialog.cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirm}
            disabled={logout.isPending}
            startIcon={
              logout.isPending ? (
                <CircularProgress size={14} color="inherit" />
              ) : undefined
            }
          >
            {t('logoutDialog.confirm')}
          </Button>
        </Box>
      </Box>
    </BasePopup>
  );
}
