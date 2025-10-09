// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { sortParticipants } from '@livekit/components-core';
import { ParticipantContext, useRemoteParticipant, useRemoteParticipants } from '@livekit/components-react';
import { Box, IconButton as MuiIconButton, Slide, styled } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CloseIcon, PinIcon } from '../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fullscreenActions } from '../../store/slices/fullscreen/slice';
import { selectParticipantName } from '../../store/slices/participantsSlice';
import { pinnedParticipantIdSet, selectPinnedParticipantId } from '../../store/slices/uiSlice';
import type { ParticipantId } from '../../types';
import LocalVideo from '../LocalVideo';
import ParticipantWindow from '../ParticipantWindow';
import Toolbar from '../Toolbar';

const Container = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '100%',
});

const ButtonsContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 15,
  right: 15,
  zIndex: theme.zIndex.mobileStepper,
  display: 'flex',
  gap: theme.spacing(1.5),
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
  zIndex: theme.zIndex.mobileStepper,
}));

const IconButton = styled(MuiIconButton)(({ theme }) => ({
  zIndex: theme.zIndex.mobileStepper,
  padding: theme.spacing(0.75),
  background: theme.palette.background.highlight.primary,
  color: theme.palette.background.highlight.contrastText,
  border: 'solid',
  borderWidth: theme.typography.pxToRem(1),
  borderColor: theme.palette.background.highlight.contrastText,
}));

const FullscreenView = () => {
  const { t } = useTranslation();
  const [hasVisibleControls, setVisibleControls] = useState<boolean>(false);
  const [isLocalVideoPinned, setIsLocalVideoPinned] = useState<boolean>(false);
  const pinnedParticipantId = useAppSelector(selectPinnedParticipantId);

  const remoteParticipants = useRemoteParticipants();
  const lastSpeakerId = useMemo(() => {
    const activeSpeaker = sortParticipants(remoteParticipants)?.at(0);
    return activeSpeaker?.identity as ParticipantId | undefined;
  }, [remoteParticipants]);
  const selectedParticipantId = pinnedParticipantId || lastSpeakerId;

  const selectedParticipant = useRemoteParticipant({ identity: selectedParticipantId || '' });
  const displayName = useAppSelector((state) =>
    selectedParticipantId ? selectParticipantName(state, selectedParticipantId) : undefined
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (hasVisibleControls) {
      timeout = setTimeout(() => setVisibleControls(false), 5000);
    }
    return () => timeout && clearTimeout(timeout);
  }, [hasVisibleControls]);

  const toggleLocalVideoPin = () => setIsLocalVideoPinned((prevState) => !prevState);

  const handleCloseFullscreen = () => {
    dispatch(fullscreenActions.exit());
  };

  const isActive = hasVisibleControls;
  const isPinned = pinnedParticipantId ? pinnedParticipantId === selectedParticipant?.identity : false;
  const togglePin = useCallback(() => {
    const updatePinnedId = pinnedParticipantId === lastSpeakerId ? undefined : lastSpeakerId;
    dispatch(pinnedParticipantIdSet(updatePinnedId));
  }, [dispatch, lastSpeakerId, pinnedParticipantId]);

  return (
    <ParticipantContext.Provider value={selectedParticipant}>
      <Container
        onMouseMove={() => setVisibleControls(true)}
        onMouseLeave={() => setVisibleControls(false)}
        data-testid="fullscreen"
      >
        <ButtonsContainer>
          <IconButton
            aria-label={t('indicator-pinned', {
              participantName: displayName || '',
            })}
            onClick={togglePin}
            color={isPinned ? 'primary' : 'secondary'}
          >
            <PinIcon />
          </IconButton>
          <IconButton aria-label={t('indicator-fullscreen-close')} onClick={handleCloseFullscreen} color="primary">
            <CloseIcon />
          </IconButton>
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
    </ParticipantContext.Provider>
  );
};

export default FullscreenView;
