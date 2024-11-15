// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Stack, styled } from '@mui/material';
import { useAuthContext } from '@opentalk/redux-oidc';
import { useTranslation } from 'react-i18next';

import { LogoIcon } from '../../assets/icons';
import ImprintContainer from '../../components/ImprintContainer';
import JoinMeetingDialog from '../../components/JoinMeetingDialog';

const Container = styled(Stack)({
  display: 'flex',
  justifySelf: 'center',
  justifyContent: 'center',
  alignItems: 'center',
  maxWidth: 500,
});

const ButtonGroup = styled(Stack)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: theme.spacing(4),
  width: '30em',
  [theme.breakpoints.down('md')]: {
    maxWidth: '80vw',
  },
}));

export const LandingPage = () => {
  const auth = useAuthContext();
  const { t } = useTranslation();

  const handleSignIn = () => {
    auth?.signIn('/dashboard');
  };

  return (
    <>
      <Container spacing={1}>
        <LogoIcon width="15em" height="5em" />
        <ButtonGroup spacing={2}>
          <JoinMeetingDialog />
          <Button onClick={handleSignIn} disabled={!auth}>
            {t('dashboard-sign-in')}
          </Button>
        </ButtonGroup>
      </Container>

      <ImprintContainer />
    </>
  );
};
