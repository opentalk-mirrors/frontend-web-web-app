// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { styled } from '@mui/material';
import { memo, useRef } from 'react';

import { useAppSelector } from '../../hooks';
import { E2EEData } from '../../hooks/useE2EE';
import { useHotkeys } from '../../hooks/useHotkeys';
import useRoom from '../../hooks/useRoom';
import { selectLivekitAccessToken, selectLivekitPublicUrl } from '../../store/slices/livekitSlice';
import { selectSubroomAudioToken } from '../../store/slices/subroomAudioSlice';
import { selectShowCoffeeBreakCurtain } from '../../store/slices/uiSlice';
import { selectIsModerator } from '../../store/slices/userSlice';
import CoffeeBreakView from '../CoffeeBreakView';
import TimerPopover from '../TimerPopover';
import InnerLayout from './fragments/InnerLayout';
import { ParticipationConfirmationDialog } from './fragments/ParticipationConfirmationDialog';

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

const RoomContainer = styled(LiveKitRoom)(() => {
  return {
    display: 'contents',
  };
});

const WhisperContext = styled(LiveKitRoom)(() => {
  return {
    display: 'none',
  };
});

const CachedTimerPopover = memo(TimerPopover);
const CachedInnerLayout = memo(InnerLayout);

interface MeetingViewProps {
  e2eeData: E2EEData;
}

const MeetingView = ({ e2eeData }: MeetingViewProps) => {
  const showCoffeeBreakCurtain = useAppSelector(selectShowCoffeeBreakCurtain);
  const isModerator = useAppSelector(selectIsModerator);
  const containerRef = useRef(null);
  const enableAudio = isModerator || !showCoffeeBreakCurtain;
  const livekitAccessToken = useAppSelector(selectLivekitAccessToken);
  const publicUrl = useAppSelector(selectLivekitPublicUrl);
  const whisperToken = useAppSelector(selectSubroomAudioToken);

  const room = useRoom({ e2eeData });
  const whisperRoom = useRoom({ e2eeData, isWhisperRoom: true });
  useHotkeys(room, whisperRoom);

  return (
    <>
      {whisperToken && (
        <WhisperContext token={whisperToken} room={whisperRoom} serverUrl={publicUrl} video={false} audio={false}>
          <RoomAudioRenderer />
        </WhisperContext>
      )}
      <RoomContainer room={room} token={livekitAccessToken} serverUrl={publicUrl} video={false} audio={false}>
        <Container ref={containerRef}>
          {showCoffeeBreakCurtain && !isModerator ? (
            <CoffeeBreakView />
          ) : (
            <>
              {enableAudio && <RoomAudioRenderer />}

              <ParticipationConfirmationDialog />

              <CachedInnerLayout />

              {!showCoffeeBreakCurtain && <CachedTimerPopover />}
            </>
          )}
        </Container>
      </RoomContainer>
    </>
  );
};

export default MeetingView;
