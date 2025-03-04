// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { CircularProgress, Stack, styled } from '@mui/material';

import { useAppSelector } from '../../../hooks';
import { ConnectionState } from '../../../modules/WebRTC/ConferenceRoom';
import { selectRoomConnectionState } from '../../../store/slices/roomSlice';
import Ballot from '../../Ballot';
import Cinema from '../fragments/Cinema';

const Container = styled(Stack)(() => ({
  justifyContent: 'space-between',
  overflow: 'auto',
  height: '100%',
}));

const InnerContainer = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(1, 0.7),
  height: '100%',
}));

const CircularProgressBar = styled(CircularProgress)({
  margin: 'auto',
});

const MobileCinemaContainer = () => {
  const connectionState = useAppSelector(selectRoomConnectionState);

  return (
    <Container>
      {connectionState === ConnectionState.Leaving || connectionState === ConnectionState.Starting ? (
        <CircularProgressBar />
      ) : (
        <InnerContainer>
          <Cinema />
          <Ballot />
        </InnerContainer>
      )}
    </Container>
  );
};

export default MobileCinemaContainer;
