// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Stack, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { NameTile } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { selectHandUp } from '../../../store/slices/moderationSlice';
import { selectDisplayName, selectOurUuid } from '../../../store/slices/userSlice';
import HandRaisedIndicator from '../../HandRaisedIndicator';
import ReactionIndicator from '../../ReactionIndicator';
import SelfVideoContent from './SelfVideoContent';

const ClipNameTile = styled(NameTile)(({ theme }) => ({
  borderRadius: theme.borderRadius.small,
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

const StatusBar = styled(Stack)(() => ({
  position: 'absolute',
  bottom: 0,
  width: '100%',
  justifyContent: 'space-evenly',
  alignItems: 'center',
}));

const PositionedReactionIndicator = styled(ReactionIndicator)(({ theme }) => ({
  position: 'absolute',
  left: theme.spacing(0.5),
  top: 0,
  bottom: theme.spacing(0.5),
}));

const PositionedHandRaisedIndicator = styled(HandRaisedIndicator)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(0.5),
  bottom: theme.spacing(0.5),
}));

type SelfViewClipProps = {
  id: string;
};

const SelfViewClip = ({ id }: SelfViewClipProps) => {
  const { t } = useTranslation();
  const displayName = useAppSelector(selectDisplayName);
  const ownParticipantId = useAppSelector(selectOurUuid);
  const handIsUp = useAppSelector(selectHandUp);
  return (
    <SelfViewClipContainer data-testid="selfview-clip" id={id}>
      <SelfVideoContent displayName={displayName} />
      <StatusBar direction="row">
        {ownParticipantId !== null && <PositionedReactionIndicator participantId={ownParticipantId} />}
        <ClipNameTile displayName={t('global-you')} showIcons={false} />
        {handIsUp && <PositionedHandRaisedIndicator label={t('indicator-you-have-raised-hand')} />}
      </StatusBar>
    </SelfViewClipContainer>
  );
};

export default SelfViewClip;
