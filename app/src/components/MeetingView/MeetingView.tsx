// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { styled } from '@mui/material';
import { memo, useEffect, useRef, useState } from 'react';

import { useAppSelector } from '../../hooks';
import { useHotkeys } from '../../hooks/useHotkeys';
import {
  selectAudioEnabled,
  selectLivekitAccessToken,
  selectLivekitPublicUrl,
  selectLivekitRoom,
  selectLivekitWhisperRoom,
  selectVideoEnabled,
} from '../../store/slices/livekitSlice';
import { selectIsRoomDeleted } from '../../store/slices/roomSlice';
import { selectSubroomAudioToken } from '../../store/slices/subroomAudioSlice';
import { selectShowCoffeeBreakCurtain } from '../../store/slices/uiSlice';
import { selectIsModerator } from '../../store/slices/userSlice';
import CoffeeBreakView from '../CoffeeBreakView';
import TimerPopover from '../TimerPopover';
import InnerLayout from './fragments/InnerLayout';
import MeetingEndedDialog from './fragments/MeetingEndedDialog';
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

const MeetingView = () => {
  const livekitAccessToken = useAppSelector(selectLivekitAccessToken);
  const publicUrl = useAppSelector(selectLivekitPublicUrl);
  const whisperToken = useAppSelector(selectSubroomAudioToken);
  const isRoomDeleted = useAppSelector(selectIsRoomDeleted);
  const showCoffeeBreakCurtain = useAppSelector(selectShowCoffeeBreakCurtain);
  const isModerator = useAppSelector(selectIsModerator);
  const enableAudio = isModerator || !showCoffeeBreakCurtain;
  const isAudioEnabled = useAppSelector(selectAudioEnabled);
  const isVideoEnabled = useAppSelector(selectVideoEnabled);

  const containerRef = useRef(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const room = useAppSelector(selectLivekitRoom);
  const whisperRoom = useAppSelector(selectLivekitWhisperRoom);

  useHotkeys(room, whisperRoom);

  useEffect(() => {
    if (isRoomDeleted) {
      setIsDialogOpen(true);
    }
  }, [isRoomDeleted]);

  return (
    <>
      {whisperToken && (
        <WhisperContext token={whisperToken} room={whisperRoom} serverUrl={publicUrl} video={false} audio={false}>
          <RoomAudioRenderer />
        </WhisperContext>
      )}
      <RoomContainer
        room={room}
        token={livekitAccessToken}
        serverUrl={publicUrl}
        video={isVideoEnabled}
        audio={isAudioEnabled}
      >
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
        {isDialogOpen && <MeetingEndedDialog setIsDialogOpen={setIsDialogOpen} />}
      </RoomContainer>
    </>
  );
};

export default MeetingView;
