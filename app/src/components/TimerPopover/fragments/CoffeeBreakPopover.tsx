// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, Typography, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { CoffeeBreakIcon as CoffeeBreakIconDefault } from '../../../assets/icons';
import { useAppSelector } from '../../../hooks';
import { selectTimerActive } from '../../../store/slices/timerSlice';
import { TimerStyle } from '../../../types';
import TimerDuration from '../../TimerTab/fragments/TimerDuration';
import { Container } from './Container';

const CoffeeBreakIcon = styled(CoffeeBreakIconDefault)(({ theme }) => ({
  height: '4rem',
  width: 'auto',
  fill: theme.palette.secondary.light,
}));

const CoffeeBreakPopover = () => {
  const { t } = useTranslation();
  const timerActive = useAppSelector(selectTimerActive);

  return (
    <Container open={Boolean(timerActive)} role="dialog" aria-labelledby="transition-modal-title">
      <Stack
        spacing={1}
        sx={{
          alignItems: 'center',
        }}
      >
        <Typography id="transition-modal-title" variant="h5" component="h3">
          {t('coffee-break-popover-title')}
        </Typography>

        <CoffeeBreakIcon />

        <TimerDuration alignItems="center" style={TimerStyle.CoffeeBreak} />
      </Stack>
    </Container>
  );
};

export default CoffeeBreakPopover;
