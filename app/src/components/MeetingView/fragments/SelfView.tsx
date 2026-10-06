// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Portal, alpha, styled, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { CloseFullscreenIcon, OpenInFullIcon } from '../../../assets/icons';
import { OverlayIconButton } from '../../../commonComponents';
import { useAppSelector, useAppDispatch } from '../../../hooks';
import { useSelfViewAnchor } from '../../../provider/SelfViewAnchorContext';
import { selectIsSelfViewMinimized, toggledSelfViewMinimized } from '../../../store/slices/uiSlice';
import SelfViewBar from './SelfViewBar';
import SelfViewClip from './SelfViewClip';

const SelfViewContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isMinimized',
})<{ isMinimized: boolean }>(({ theme, isMinimized }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  bottom: theme.spacing(1),
  borderRadius: theme.borderRadius.medium,
  boxShadow: `0 2px 10px ${alpha(theme.palette.common.black, 0.35)}`,
  outline: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
  outlineOffset: '-1px',
  zIndex: theme.zIndex.fab,
  pointerEvents: 'auto',
  // The selfview anchor container in the speaker view disables pointer events so it doesn't block the speaker window,
  // re-enable them here, to make the minimize button interactive again
  ...(isMinimized
    ? { width: 100 }
    : {
        [theme.breakpoints.down('sm')]: {
          width: '93px',
        },
        [theme.breakpoints.up('sm')]: {
          width: '120px',
        },
        [theme.breakpoints.up('lg')]: {
          width: '150px',
        },
      }),
}));

const MinimizeButton = styled(OverlayIconButton, {
  shouldForwardProp: (prop) => prop !== 'isMinimized',
})<{ isMinimized: boolean }>(({ theme, isMinimized }) => ({
  position: 'absolute',
  right: theme.spacing(0.5),
  ...(isMinimized ? { top: '50%', transform: 'translateY(-50%)' } : { top: theme.spacing(0.5) }),
}));

const CLIP_ID = 'self-view-clip-id';
const BAR_ID = 'self-view-bar-id';

const SelfView = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { anchor } = useSelfViewAnchor();
  const isMinimized = useAppSelector(selectIsSelfViewMinimized);

  const buttonLabel = isMinimized ? t('selfview-expand') : t('selfview-minimize');
  const contentId = isMinimized ? BAR_ID : CLIP_ID;

  return (
    // E.g. in case of speaker view layout we need to portal self view to a different location
    <Portal container={anchor} disablePortal={!anchor}>
      <SelfViewContainer isMinimized={isMinimized}>
        {isMinimized ? <SelfViewBar id={BAR_ID} /> : <SelfViewClip id={CLIP_ID} />}
        <Tooltip title={buttonLabel}>
          <MinimizeButton
            onClick={() => {
              dispatch(toggledSelfViewMinimized());
            }}
            size="small"
            isMinimized={isMinimized}
            aria-label={buttonLabel}
            aria-controls={contentId}
            aria-expanded={!isMinimized}
          >
            {isMinimized ? <OpenInFullIcon /> : <CloseFullscreenIcon />}
          </MinimizeButton>
        </Tooltip>
      </SelfViewContainer>
    </Portal>
  );
};

export default SelfView;
