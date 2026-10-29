// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Link, styled, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Container = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  [theme.breakpoints.up('md')]: {
    whiteSpace: 'nowrap',
  },
}));

interface AccountActionProps {
  isLoggedIn: boolean;
  onSignIn: () => void;
  onSwitchAccount: () => void;
}

const AccountAction = ({ isLoggedIn, onSignIn, onSwitchAccount }: AccountActionProps) => {
  const { t } = useTranslation();

  return (
    <Container>
      <Typography variant="body2">
        {isLoggedIn ? (
          <Link
            component="button"
            type="button"
            color="inherit"
            onClick={onSwitchAccount}
            sx={{ verticalAlign: 'baseline' }}
          >
            {t('lobby-switch-account')}
          </Link>
        ) : (
          <>
            {t('lobby-already-registered')}
            <Link
              component="button"
              variant="body1"
              type="button"
              color="inherit"
              onClick={onSignIn}
              sx={{ display: 'block' }}
            >
              {t('dashboard-sign-in')}
            </Link>
          </>
        )}
      </Typography>
    </Container>
  );
};

export default AccountAction;
