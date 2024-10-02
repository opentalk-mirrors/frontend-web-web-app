// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { CircularProgress, styled } from '@mui/material';

import { useAppSelector } from '../../../hooks';
import { ConnectionState, selectRoomConnectionState } from '../../../store/slices/roomSlice';
import { selectShowCoffeeBreakCurtain } from '../../../store/slices/uiSlice';
import { selectIsModerator } from '../../../store/slices/userSlice';
import Ballot from '../../Ballot';
import { CoffeeBreakView } from '../../CoffeeBreakView/CoffeeBreakView';
import JumpLinkContainer from '../../JumpLinkContainer';
import MeetingHeader from '../../MeetingHeader';
import MeetingSidebar from '../../MeetingSidebar/index';
import Cinema from './Cinema';

const InnerContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  height: '100%',
  width: '100%',
  padding: theme.spacing(2),
  gap: theme.spacing(2),
  minHeight: 0,
  gridTemplate: 'auto 1fr / auto 1fr',
}));

const CircularProgressBar = styled(CircularProgress)({
  margin: 'auto',
});

const DesktopInnerLayout = () => {
  const connectionState = useAppSelector(selectRoomConnectionState);
  const showCoffeeBreakCurtain = useAppSelector(selectShowCoffeeBreakCurtain);
  const isModerator = useAppSelector(selectIsModerator);

  return (
    <InnerContainer>
      <JumpLinkContainer />
      <MeetingSidebar />

      {showCoffeeBreakCurtain && isModerator ? (
        <CoffeeBreakView roundBorders />
      ) : (
        <>
          <MeetingHeader />
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
    </InnerContainer>
  );
};

export default DesktopInnerLayout;
