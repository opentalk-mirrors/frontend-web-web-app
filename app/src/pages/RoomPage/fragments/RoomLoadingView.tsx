// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { CircularProgress, Container as MuiContainer, Stack, Typography, styled } from '@mui/material';
import { useMemo } from 'react';
import { Trans } from 'react-i18next';

import { ReconnectionDialog } from '../../../components/ReconnectionDialog';
import { useAppSelector } from '../../../hooks';
import { ConnectionState } from '../../../modules/WebRTC/ConferenceRoom';
import { selectRoomConnectionState } from '../../../store/slices/roomSlice';

const Container = styled(MuiContainer)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  color: theme.palette.common.white,
}));

const Title = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.white,
  padding: theme.spacing(2, 0),
}));

const Text = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.white,
  fontWeight: '200',
  textAlign: 'center',
}));

const RoomLoadingView = () => {
  const connectionState = useAppSelector(selectRoomConnectionState);

  const connectionStateKey: string = useMemo(() => {
    switch (connectionState) {
      case ConnectionState.Setup:
        return 'room-loading-setup';
      case ConnectionState.Starting:
        return 'room-loading-starting';
      case ConnectionState.Blocked:
        return 'room-loading-blocked';
      default:
        return 'room-loading-generic';
    }
  }, [connectionState]);

  return (
    <Container>
      <Stack
        spacing={2}
        sx={{
          alignItems: 'center',
        }}
      >
        {connectionState === ConnectionState.Failed ? (
          <ReconnectionDialog />
        ) : (
          <>
            <CircularProgress color="secondary" size="8rem" />
            <Trans
              i18nKey={connectionStateKey}
              components={{
                title: <Title variant="h4" />,
                bodyText: <Text variant="h1" />,
              }}
            />
          </>
        )}
      </Stack>
    </Container>
  );
};

export default RoomLoadingView;
