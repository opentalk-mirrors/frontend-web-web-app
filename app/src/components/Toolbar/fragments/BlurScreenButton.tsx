// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useTrackToggle } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useTranslation } from 'react-i18next';

import { PictureIcon } from '../../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { setBackgroundEffects } from '../../../store/commonActions';
import { selectVideoBackgroundEffects } from '../../../store/slices/livekitSlice';
import ToolbarButton from './ToolbarButton';

const BlurScreenButton = ({ isLobby }: { isLobby?: boolean }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const videoBackgroundEffects = useAppSelector(selectVideoBackgroundEffects);
  const isBlurred = videoBackgroundEffects?.style === 'blur' || false;
  const { pending: isLoadingMedia } = useTrackToggle({
    source: Track.Source.Camera,
  });

  const tooltipText = isBlurred
    ? t('toolbar-button-blur-turn-off-tooltip-title')
    : t('toolbar-button-blur-turn-on-tooltip-title');

  return (
    <ToolbarButton
      tooltipTitle={tooltipText}
      active={isBlurred}
      onClick={() => {
        dispatch(setBackgroundEffects({ style: isBlurred ? 'off' : 'blur' }));
      }}
      disabled={isLoadingMedia}
      isLobby={isLobby}
      data-testid="toolbarBlurScreenButton"
    >
      <PictureIcon />
    </ToolbarButton>
  );
};

export default BlurScreenButton;
