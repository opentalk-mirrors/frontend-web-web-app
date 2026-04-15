// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  ParticipantContext,
  useRemoteParticipant,
  useRemoteParticipants,
  useSortedParticipants,
} from '@livekit/components-react';
import { Box, IconButton as MuiIconButton, Slide, styled } from '@mui/material';
import { ParticipantEvent, RoomEvent } from 'livekit-client';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CloseIcon, PinIcon, PollIcon } from '../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fullscreenActions, selectFullscreenElement } from '../../store/slices/fullscreen/slice';
import { selectParticipantName } from '../../store/slices/participantsSlice';
import { pinnedConnectionIdentifierSet, selectPinnedConnectionIdentifier } from '../../store/slices/uiSlice';
import type { ConnectionIdentifier } from '../../types';
import { deconstructConnectionIdentifier } from '../../utils/deconstructConnectionIdentifier';
import Ballot from '../Ballot';
import LocalVideo from '../LocalVideo';
import VotesAndPollsResultsPopover from '../MeetingHeader/fragments/VotesAndPollsResultsPopover';
import ParticipantWindow from '../ParticipantWindow';
import TimerPopover from '../TimerPopover/TimerPopover';
import Toolbar from '../Toolbar';

const Container = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '100%',
});

const ButtonsContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 15,
  left: 0,
  width: '100%',
  padding: theme.spacing(0, 2),
  zIndex: theme.zIndex.fab,
  display: 'grid',
  gridTemplateAreas: `'votes buttons'`,
}));

const ToolbarWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  zIndex: theme.zIndex.mobileStepper,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const LocalVideoContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  width: '18%',
  zIndex: theme.zIndex.appBar,
}));

const IconButton = styled(MuiIconButton)(({ theme, 'aria-pressed': ariaPressed }) => ({
  zIndex: theme.zIndex.mobileStepper,
  padding: theme.spacing(0.75),
  background: ariaPressed ? theme.palette.secondary.main : theme.palette.background.highlight.primary,
  color: ariaPressed ? theme.palette.secondary.contrastText : theme.palette.background.highlight.contrastText,
  border: 'solid',
  borderWidth: theme.typography.pxToRem(1),
  borderColor: ariaPressed ? theme.palette.secondary.main : theme.palette.background.highlight.contrastText,
  opacity: 0.8,
  ':hover': {
    opacity: 1,
    background: ariaPressed ? theme.palette.secondary.main : theme.palette.background.highlight.primary,
    color: ariaPressed ? theme.palette.secondary.contrastText : theme.palette.background.highlight.contrastText,
  },
}));

const FullscreenView = () => {
  const { t } = useTranslation();
  const [hasVisibleControls, setVisibleControls] = useState<boolean>(false);
  const [isLocalVideoPinned, setIsLocalVideoPinned] = useState<boolean>(false);
  const pinnedConnectionIdentifier = useAppSelector(selectPinnedConnectionIdentifier);
  const sortedParticipants = useSortedParticipants(
    useRemoteParticipants({
      updateOnlyOn: [
        RoomEvent.ParticipantConnected,
        RoomEvent.ParticipantDisconnected,
        RoomEvent.ActiveSpeakersChanged,
        RoomEvent.TrackPublished,
      ],
    })
  ); //TODO: Recheck for ActiveSpeakersChanged
  const sortedParticipantsIdentity = sortedParticipants[0]?.identity as ConnectionIdentifier | undefined;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectedConnectionIdentifier = pinnedConnectionIdentifier || sortedParticipantsIdentity;
  const selectedParticipantId = (() => {
    if (!selectedConnectionIdentifier) {
      return undefined;
    }
    const { participantId } = deconstructConnectionIdentifier(selectedConnectionIdentifier);
    return participantId;
  })();

  const selectedParticipant = useRemoteParticipant(selectedConnectionIdentifier || '', {
    updateOnlyOn: [
      ParticipantEvent.TrackMuted,
      ParticipantEvent.TrackUnmuted,
      ParticipantEvent.TrackSubscribed,
      ParticipantEvent.TrackUnsubscribed,
    ],
  });
  const displayName = useAppSelector((state) =>
    selectedParticipantId ? selectParticipantName(state, selectedParticipantId) : undefined
  );
  const fullscreenElement = useAppSelector(selectFullscreenElement);

  const dispatch = useAppDispatch();

  const handleMouseMove = useCallback(() => {
    if (!hasVisibleControls) {
      setVisibleControls(true);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setVisibleControls(false);
      timeoutRef.current = null;
    }, 5000);
  }, [hasVisibleControls]);

  const toggleLocalVideoPin = () => setIsLocalVideoPinned((prevState) => !prevState);

  const handleCloseFullscreen = () => {
    dispatch(fullscreenActions.exit());
  };

  const isActive = hasVisibleControls;
  const isPinned = pinnedConnectionIdentifier ? pinnedConnectionIdentifier === selectedParticipant?.identity : false;
  const togglePin = useCallback(() => {
    const updatePinnedId =
      pinnedConnectionIdentifier === sortedParticipantsIdentity ? undefined : sortedParticipantsIdentity;
    dispatch(pinnedConnectionIdentifierSet(updatePinnedId));
  }, [dispatch, sortedParticipantsIdentity, pinnedConnectionIdentifier]);

  return (
    <ParticipantContext.Provider value={selectedParticipant}>
      <Container onMouseMove={handleMouseMove} onMouseLeave={() => setVisibleControls(false)} data-testid="fullscreen">
        <ButtonsContainer>
          <VotesAndPollsResultsPopover
            renderButton={(props) => (
              <Box gridArea="votes" justifySelf="flex-start">
                <IconButton {...props}>
                  <PollIcon />
                </IconButton>
              </Box>
            )}
          />
          <Box display="flex" gap={1} alignItems="center" justifySelf="flex-end" gridArea="buttons">
            <IconButton
              aria-label={t('indicator-pinned', {
                participantName: displayName || '',
              })}
              onClick={togglePin}
              aria-pressed={isPinned}
            >
              <PinIcon />
            </IconButton>
            <IconButton aria-label={t('indicator-fullscreen-close')} onClick={handleCloseFullscreen} color="primary">
              <CloseIcon />
            </IconButton>
          </Box>
        </ButtonsContainer>
        <Slide direction="down" in={isLocalVideoPinned || isActive} mountOnEnter>
          <LocalVideoContainer data-testid="fullscreenLocalVideo">
            <LocalVideo fullscreenMode togglePinVideo={toggleLocalVideoPin} isVideoPinned={isLocalVideoPinned} />
          </LocalVideoContainer>
        </Slide>
        <Slide direction="up" in={isActive} mountOnEnter unmountOnExit>
          <ToolbarWrapper>
            <Toolbar layout="fullscreen" />
          </ToolbarWrapper>
        </Slide>
        {selectedParticipant && <ParticipantWindow activePresenter={isActive} />}
      </Container>
      <Ballot container={fullscreenElement} />
      <TimerPopover />
    </ParticipantContext.Provider>
  );
};

export default FullscreenView;
