// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { CircularProgress, styled } from '@mui/material';

import { useAppSelector } from '../../../hooks';
import useConferenceUiVersion from '../../../hooks/useConferenceUiVersion';
import { ConnectionState } from '../../../modules/WebRTC/ConferenceRoom';
import { selectRoomConnectionState } from '../../../store/slices/roomSlice';
import { selectShowCoffeeBreakCurtain } from '../../../store/slices/uiSlice';
import { selectIsModerator } from '../../../store/slices/userSlice';
import Ballot from '../../Ballot';
import CoffeeBreakView from '../../CoffeeBreakView';
import JumpLinkContainer from '../../JumpLinkContainer';
import MeetingFooter from '../../MeetingFooter';
import MeetingHeader from '../../MeetingHeader';
import MeetingSidebar from '../../MeetingSidebar';
import Cinema from './Cinema';
import DesktopInnerLayoutLegacy from './DesktopInnerLayoutLegacy';

const InnerContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  height: '100%',
  width: '100%',
  padding: theme.spacing(2),
  gap: theme.spacing(2),
  minHeight: 0,
  gridTemplateRows: 'auto 1fr auto',
  gridTemplateColumns: 'auto 1fr',
  gridTemplateAreas: `
    'sidebar header'
    'sidebar main'
    'footer  footer'
  `,
}));

const CircularProgressBar = styled(CircularProgress)({
  gridArea: 'main',
  margin: 'auto',
});

const DesktopInnerLayout = () => {
  const { isV2 } = useConferenceUiVersion();
  const connectionState = useAppSelector(selectRoomConnectionState);
  const showCoffeeBreakCurtain = useAppSelector(selectShowCoffeeBreakCurtain);
  const isModerator = useAppSelector(selectIsModerator);

  // V2-CLEANUP: drop this guard and DesktopInnerLayoutLegacy
  if (!isV2) {
    return <DesktopInnerLayoutLegacy />;
  }

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
      <MeetingFooter />
    </InnerContainer>
  );
};

export default DesktopInnerLayout;
