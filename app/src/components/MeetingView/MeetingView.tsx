// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { styled } from '@mui/material';
import { memo, useRef } from 'react';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { selectUserAsParticipant } from '../../store/selectors';
import {
  selectAudioEnabled,
  selectLivekitAccessToken,
  selectLivekitPublicUrl,
  selectLivekitRoom,
  selectLivekitWhisperRoom,
  selectVideoEnabled,
} from '../../store/slices/livekitSlice';
import { selectSubroomAudioToken } from '../../store/slices/subroomAudioSlice';
import {
  selectSelfRenameDialogVisible,
  selectShowCoffeeBreakCurtain,
  setSelfRenameDialogVisible,
} from '../../store/slices/uiSlice';
import { selectIsModerator } from '../../store/slices/userSlice';
import CoffeeBreakView from '../CoffeeBreakView';
import RenameParticipantDialog from '../Participants/fragments/RenameParticipantDialog';
import TimerPopover from '../TimerPopover';
import InactivityGuard from './fragments/InactivityGuard';
import InnerLayout from './fragments/InnerLayout';
import { ParticipationConfirmationDialog } from './fragments/ParticipationConfirmationDialog';

const Container = styled('div')(({ theme }) => ({
  background: theme.palette.background.main.primary,
  color: theme.palette.background.main.contrastText,
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
  const showCoffeeBreakCurtain = useAppSelector(selectShowCoffeeBreakCurtain);
  const isModerator = useAppSelector(selectIsModerator);
  const enableAudio = isModerator || !showCoffeeBreakCurtain;
  const isAudioEnabled = useAppSelector(selectAudioEnabled);
  const isVideoEnabled = useAppSelector(selectVideoEnabled);

  const containerRef = useRef(null);

  const room = useAppSelector(selectLivekitRoom);
  const whisperRoom = useAppSelector(selectLivekitWhisperRoom);

  const dispatch = useAppDispatch();
  const isSelfRenameDialogVisible = useAppSelector(selectSelfRenameDialogVisible);
  const participant = useAppSelector(selectUserAsParticipant);
  const close = () => dispatch(setSelfRenameDialogVisible(false));

  if (room === undefined) {
    return null;
  }

  return (
    <>
      {whisperToken && whisperRoom && (
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

        <InactivityGuard />
        {isSelfRenameDialogVisible && participant && (
          <RenameParticipantDialog open onClose={close} participant={participant} selfRename />
        )}
      </RoomContainer>
    </>
  );
};

export default MeetingView;
