// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useLocalParticipant } from '@livekit/components-react';
import { Stack, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { CameraOnIcon } from '../../../assets/icons';
import { NameTile } from '../../../commonComponents';

const BarNameTile = styled(NameTile)(() => ({
  fontSize: 'clamp(0.5rem, 7cqi, 0.9rem)',
  '& .MuiTypography-root': { fontSize: 'inherit' },
}));

const SelfViewBarContainer = styled(Stack)(({ theme }) => ({
  width: '100%',
  borderRadius: 'inherit',
  containerType: 'inline-size',
  background: theme.palette.background.customPaper.primary,
  justifyContent: 'center',
  alignItems: 'center',
  paddingRight: theme.spacing(1),
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

  return (
    <SelfViewBarContainer direction="row" data-testid="selfview-bar" id={id}>
      {isCameraEnabled && <CameraOnIcon />}
      <BarNameTile displayName={t('global-you')} showIcons={false} />
    </SelfViewBarContainer>
  );
};

export default SelfViewBar;
