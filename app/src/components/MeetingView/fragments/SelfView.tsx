// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Portal, alpha, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { NameTile } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { useSelfViewAnchor } from '../../../provider/SelfViewAnchorContext';
import { selectDisplayName } from '../../../store/slices/userSlice';
import SelfVideoContent from './SelfVideoContent';

const SelfViewNameTile = styled(NameTile)(({ theme }) => ({
  position: 'absolute',
  borderRadius: theme.borderRadius.small,
  bottom: theme.spacing(0.5),
  left: theme.spacing(0.5),
  fontSize: 'clamp(0.5rem, 7cqi, 0.9rem)',
  '& .MuiTypography-root': { fontSize: 'inherit' },
}));

// The self view is split into two containers on purpose:
// - SelfViewClip needs `mask-image` to keep the video from swallowing the rounded corners.
//   A mask clips everything the element paints outside its border box, including its own box-shadow.
// - SelfViewContainer therefore carries the shadow (and positioning/sizing) without a mask,
//   so the shadow stays visible around the clipped content.
const SelfViewContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  bottom: theme.spacing(1),
  borderRadius: theme.borderRadius.medium,
  boxShadow: `0 2px 10px ${alpha(theme.palette.common.black, 0.35)}`,
  outline: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
  outlineOffset: '-1px',
  zIndex: theme.zIndex.fab,
  [theme.breakpoints.down('sm')]: {
    width: '93px',
    height: '140px',
    // For the fallback avatar
    '& .MuiAvatar-root': { width: theme.spacing(8), height: theme.spacing(8) },
  },
  [theme.breakpoints.up('sm')]: {
    width: '120px',
    height: '80px',
    // For the fallback avatar
    '& .MuiAvatar-root': { width: theme.spacing(6), height: theme.spacing(6) },
  },
  [theme.breakpoints.up('lg')]: {
    width: '150px',
    height: '100px',
    // For the fallback avatar
    '& .MuiAvatar-root': { width: theme.spacing(8), height: theme.spacing(8) },
  },
}));

const SelfViewClip = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  // Mask image and overflow are needed, otherwise video content
  // overlaps the container border
  borderRadius: 'inherit',
  maskImage: 'linear-gradient(black, white)',
  overflow: 'hidden',
  containerType: 'inline-size',
  background: theme.palette.background.customPaper.primary,
}));

const SelfView = () => {
  const { t } = useTranslation();
  const { anchor } = useSelfViewAnchor();
  const displayName = useAppSelector(selectDisplayName);

  return (
    // E.g. in case of speaker view layout we need to portal self view to a different location
    <Portal container={anchor} disablePortal={!anchor}>
      <SelfViewContainer data-testid="selfview-container">
        <SelfViewClip>
          <SelfVideoContent displayName={displayName} />
          <SelfViewNameTile displayName={t('global-you')} showIcons={false} />
        </SelfViewClip>
      </SelfViewContainer>
    </Portal>
  );
};

export default SelfView;
