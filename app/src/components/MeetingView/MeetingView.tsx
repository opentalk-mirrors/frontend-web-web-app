// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';
import { useRef, memo } from 'react';

import { useAppSelector } from '../../hooks';
import { useHotkeys } from '../../hooks/useHotkeys';
import { useUpdateDocumentTitle } from '../../hooks/useUpdateDocumentTitle';
import { selectRoomTitle } from '../../store/selectors';
import { selectDebugMode, selectShowCoffeeBreakCurtain } from '../../store/slices/uiSlice';
import { selectIsModerator } from '../../store/slices/userSlice';
import { CoffeeBreakView } from '../CoffeeBreakView/CoffeeBreakView';
import DebugPanel from '../DebugPanel';
import RemoteAudioStreams from '../RemoteAudioStreams';
import TimerPopover from '../TimerPopover';
import InnerLayout from './fragments/InnerLayout';

const Container = styled('div')(({ theme }) => ({
  background: theme.palette.background.overlay,
  overflow: 'auto',
  display: 'grid',
  height: '100%',
  width: '100%',

  '&.MuiContainer-root': {
    paddingLeft: 0,
    paddingRight: 0,
  },
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
}));

const CachedDebugPanel = memo(DebugPanel);
const CachedRemoteAudioStreams = memo(RemoteAudioStreams);
const CachedTimerPopover = memo(TimerPopover);
const CachedInnerLayout = memo(InnerLayout);

const MeetingView = () => {
  const debugMode = useAppSelector(selectDebugMode);
  const isCoffeeBreakOpen = useAppSelector(selectShowCoffeeBreakCurtain);
  const isModerator = useAppSelector(selectIsModerator);
  const containerRef = useRef(null);
  const enableAudio = isModerator || !isCoffeeBreakOpen;
  const showCoffeeBreakCurtain = useAppSelector(selectShowCoffeeBreakCurtain);

  useHotkeys();

  useUpdateDocumentTitle(useAppSelector(selectRoomTitle));

  return (
    <Container ref={containerRef}>
      {showCoffeeBreakCurtain && !isModerator ? (
        <CoffeeBreakView />
      ) : (
        <>
          {debugMode && <CachedDebugPanel />}

          {enableAudio && <CachedRemoteAudioStreams />}

          {!showCoffeeBreakCurtain && <CachedTimerPopover />}

          <CachedInnerLayout />
        </>
      )}
    </Container>
  );
};

export default MeetingView;
