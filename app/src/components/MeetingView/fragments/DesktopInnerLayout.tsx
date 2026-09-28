// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, CircularProgress, styled } from '@mui/material';

import { useAppSelector } from '../../../hooks';
import useConferenceUiVersion from '../../../hooks/useConferenceUiVersion';
import { ConnectionState } from '../../../modules/WebRTC/ConferenceRoom';
import { selectRoomConnectionState } from '../../../store/slices/roomSlice';
import { selectIsSidePanelOpen, selectShowCoffeeBreakCurtain } from '../../../store/slices/uiSlice';
import { selectIsModerator } from '../../../store/slices/userSlice';
import Ballot from '../../Ballot';
import CoffeeBreakView from '../../CoffeeBreakView';
import JumpLinkContainer from '../../JumpLinkContainer';
import MeetingFooter from '../../MeetingFooter';
import MeetingHeader from '../../MeetingHeader';
import MeetingSidebar from '../../MeetingSidebar';
import Cinema from './Cinema';
import DesktopInnerLayoutLegacy from './DesktopInnerLayoutLegacy';

const InnerContainer = styled(Box, { shouldForwardProp: (prop) => prop !== 'isSidePanelOpen' })<{
  isSidePanelOpen: boolean;
}>(({ theme, isSidePanelOpen }) => ({
  display: 'grid',
  height: '100%',
  width: '100%',
  padding: theme.spacing(2),
  gap: theme.spacing(2),
  minHeight: 0,
  gridTemplateRows: 'auto 1fr auto',
  gridTemplateColumns: isSidePanelOpen ? '1fr auto' : '1fr',
  gridTemplateAreas: isSidePanelOpen ? `'header sidebar' 'main sidebar' 'footer footer'` : `'header' 'main' 'footer'`,
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
  const isSidePanelOpen = useAppSelector(selectIsSidePanelOpen);

  // V2-CLEANUP: drop this guard and DesktopInnerLayoutLegacy
  if (!isV2) {
    return <DesktopInnerLayoutLegacy />;
  }

  return (
    <InnerContainer isSidePanelOpen={isSidePanelOpen}>
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
      {isSidePanelOpen && <MeetingSidebar />}
      <MeetingFooter />
    </InnerContainer>
  );
};

export default DesktopInnerLayout;
