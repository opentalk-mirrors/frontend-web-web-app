// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useLocalParticipant } from '@livekit/components-react';
import { Box, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { CameraOnIcon } from '../../../assets/icons';
import { NameTile } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { selectHandUp } from '../../../store/slices/moderationSlice';
import HandRaisedIndicator from '../../HandRaisedIndicator';

const BarNameTile = styled(NameTile)(() => ({
  fontSize: 'clamp(0.5rem, 7cqi, 0.9rem)',
  maxWidth: 'none',
  '& .MuiTypography-root': { fontSize: 'inherit' },
}));

const CameraSlot = styled(Box)({
  gridColumn: 1,
  display: 'flex',
});

const NameSlot = styled(Box)({
  gridColumn: 2,
  display: 'flex',
});

const HandSlot = styled(Box)({
  gridColumn: 3,
  justifySelf: 'end',
});

const SelfViewBarContainer = styled(Box)(({ theme }) => ({
  gridTemplateColumns: '1fr auto 1fr',
  alignItems: 'center',
  paddingLeft: theme.spacing(0.5),
  paddingRight: theme.spacing(3.2),
  width: '100%',
  borderRadius: 'inherit',
  containerType: 'inline-size',
  background: theme.palette.background.customPaper.primary,
  display: 'grid',
  '& .MuiSvgIcon-root': {
    fontSize: theme.typography.pxToRem(16),
  },
  [theme.breakpoints.down('sm')]: {
    height: '30px',
  },
  [theme.breakpoints.up('sm')]: {
    height: '25px',
  },
  [theme.breakpoints.up('lg')]: {
    height: '27px',
  },
}));

type SelfViewBarProps = {
  id: string;
};

const SelfViewBar = ({ id }: SelfViewBarProps) => {
  const { t } = useTranslation();
  const { isCameraEnabled } = useLocalParticipant();
  const handIsUp = useAppSelector(selectHandUp);
  return (
    <SelfViewBarContainer data-testid="selfview-bar" id={id}>
      {isCameraEnabled && (
        <CameraSlot>
          <CameraOnIcon />
        </CameraSlot>
      )}
      <NameSlot>
        <BarNameTile displayName={t('global-you')} showIcons={false} />
      </NameSlot>
      {handIsUp && (
        <HandSlot>
          <HandRaisedIndicator label={t('indicator-you-have-raised-hand')} />
        </HandSlot>
      )}
    </SelfViewBarContainer>
  );
};

export default SelfViewBar;
