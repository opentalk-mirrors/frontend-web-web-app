// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useLocalParticipant } from '@livekit/components-react';
import { styled } from '@mui/material';
import { Track } from 'livekit-client';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { changeMedia } from '../../store/commonActions';
import { selectAudioEnabled, selectVideoEnabled } from '../../store/slices/livekitSlice';
import AudioButton from './fragments/AudioButton';
import EndCallButton from './fragments/EndCallButton';
import HandraiseButton from './fragments/HandraiseButton';
import MoreButton from './fragments/MoreButton';
import ShareScreenButton from './fragments/ShareScreenButton';
import VideoButton from './fragments/VideoButton';

type LayoutTypes = 'fullscreen';

const MainContainer = styled('aside')(({ theme }) => ({
  display: 'flex',
  background: 'transparent',
  justifyContent: 'space-evenly',
  padding: theme.spacing(2, 0),
  '&.fullscreen': {
    display: 'grid',
    gridAutoFlow: 'column',
    gap: theme.spacing(1.25),
    '.MuiButtonBase-root': {
      border: `1px solid ${theme.palette.common.white}`,
    },
    '.MuiButtonBase-root:first-of-type': {
      // padding: theme.spacing(1.5),
      width: '2.75rem',
      height: '2.35rem',
    },
  },
  [theme.breakpoints.down('md')]: {
    gap: theme.spacing(1),
    background: theme.palette.background.customPaper.primary,
  },
  [`${theme.breakpoints.down('md')} and (orientation: landscape)`]: {
    gap: theme.spacing(1),
    background: theme.palette.background.customPaper.primary,
  },
}));

const Toolbar = ({ layout }: { layout?: LayoutTypes }) => {
  const { t } = useTranslation();
  const { localParticipant } = useLocalParticipant();
  const audioTrack = localParticipant.getTrackPublication(Track.Source.Microphone)?.audioTrack;
  const audioEnabled = useAppSelector(selectAudioEnabled);
  const videoEnabled = useAppSelector(selectVideoEnabled);
  const dispatch = useAppDispatch();

  const handleAudioButtonToggle = () => {
    dispatch(changeMedia({ kind: 'audioinput', enabled: !audioEnabled }));
  };

  const handleVideoButtonToggle = () => {
    dispatch(changeMedia({ kind: 'videoinput', enabled: !videoEnabled }));
  };

  return (
    <MainContainer aria-label={t('landmark-complementary-toolbar')} className={layout}>
      <HandraiseButton />
      <ShareScreenButton />
      <AudioButton
        localAudioTrack={audioTrack}
        onAudioButtonToggle={handleAudioButtonToggle}
        audioEnabled={audioEnabled}
      />
      <VideoButton onVideoButtonToggle={handleVideoButtonToggle} videoEnabled={videoEnabled} />
      <MoreButton />
      <EndCallButton />
    </MainContainer>
  );
};

export default Toolbar;
