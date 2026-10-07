// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { NameTile } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { selectDisplayName } from '../../../store/slices/userSlice';
import SelfVideoContent from './SelfVideoContent';

const ClipNameTile = styled(NameTile)(({ theme }) => ({
  position: 'absolute',
  borderRadius: theme.borderRadius.small,
  bottom: theme.spacing(0.5),
  left: theme.spacing(0.5),
  fontSize: 'clamp(0.5rem, 7cqi, 0.9rem)',
  '& .MuiTypography-root': { fontSize: 'inherit' },
}));

// Clip needs `mask-image` to keep the video from swallowing the rounded corners.
// A mask clips everything the element paints outside its border box, including its own box-shadow,
// which is why the shadow lives on the parent container in SelfView.
const SelfViewClipContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  // Mask image and overflow are needed, otherwise video content
  // overlaps the container border
  borderRadius: 'inherit',
  maskImage: 'linear-gradient(black, white)',
  overflow: 'hidden',
  containerType: 'inline-size',
  background: theme.palette.background.customPaper.primary,
  [theme.breakpoints.down('sm')]: {
    height: '140px',
    // For the fallback avatar
    '& .MuiAvatar-root': { width: theme.spacing(8), height: theme.spacing(8) },
  },
  [theme.breakpoints.up('sm')]: {
    height: '80px',
    // For the fallback avatar
    '& .MuiAvatar-root': { width: theme.spacing(6), height: theme.spacing(6) },
  },
  [theme.breakpoints.up('lg')]: {
    height: '100px',
    // For the fallback avatar
    '& .MuiAvatar-root': { width: theme.spacing(8), height: theme.spacing(8) },
  },
}));

type SelfViewClipProps = {
  id: string;
};

const SelfViewClip = ({ id }: SelfViewClipProps) => {
  const { t } = useTranslation();
  const displayName = useAppSelector(selectDisplayName);

  return (
    <SelfViewClipContainer data-testid="selfview-clip" id={id}>
      <SelfVideoContent displayName={displayName} />
      <ClipNameTile displayName={t('global-you')} showIcons={false} />
    </SelfViewClipContainer>
  );
};

export default SelfViewClip;
