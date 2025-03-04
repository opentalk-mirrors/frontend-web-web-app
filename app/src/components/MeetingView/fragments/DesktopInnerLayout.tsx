// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { CircularProgress, styled } from '@mui/material';

import { useAppSelector } from '../../../hooks';
import { ConnectionState } from '../../../modules/WebRTC/ConferenceRoom';
import { selectRoomConnectionState } from '../../../store/slices/roomSlice';
import { selectShowCoffeeBreakCurtain } from '../../../store/slices/uiSlice';
import { selectIsModerator } from '../../../store/slices/userSlice';
import Ballot from '../../Ballot';
import CoffeeBreakView from '../../CoffeeBreakView';
import JumpLinkContainer from '../../JumpLinkContainer';
import MeetingHeader from '../../MeetingHeader';
import MeetingSidebar from '../../MeetingSidebar';
import Cinema from './Cinema';

const InnerContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  height: '100%',
  width: '100%',
  padding: theme.spacing(2),
  gap: theme.spacing(2),
  minHeight: 0,
  gridTemplateRows: 'auto 1fr',
  gridTemplateColumns: 'auto 1fr',
  gridTemplateAreas: `
    'sidebar header'
    'sidebar main'
  `,
}));

const CircularProgressBar = styled(CircularProgress)({
  gridArea: 'main',
  margin: 'auto',
});

const DesktopInnerLayout = () => {
  const connectionState = useAppSelector(selectRoomConnectionState);
  const showCoffeeBreakCurtain = useAppSelector(selectShowCoffeeBreakCurtain);
  const isModerator = useAppSelector(selectIsModerator);

  return (
    <InnerContainer>
      <JumpLinkContainer />
      <MeetingHeader />
      {showCoffeeBreakCurtain && isModerator ? (
        <CoffeeBreakView roundBorders />
      ) : (
        <>
          {connectionState === ConnectionState.Leaving || connectionState === ConnectionState.Starting ? (
            <CircularProgressBar />
          ) : (
            <>
              <Cinema />
              <Ballot />
            </>
          )}
        </>
      )}
      <MeetingSidebar />
    </InnerContainer>
  );
};

export default DesktopInnerLayout;
