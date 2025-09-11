// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, IconButton, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { AddIcon } from '../../../../assets/icons';
import { useIsMobile } from '../../../../hooks/useMediaQuery';
import getReferrerRouterState from '../../../../utils/getReferrerRouterState';

const CustomIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.borderRadius.circle,
  width: '3rem',
  height: '3rem',
  marginLeft: theme.spacing(1),
  '& > .MuiSvgIcon-root': {
    fontSize: '1.25rem',
  },
}));

const CustomButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  height: '3rem',
}));

export const CreateNewMeetingButton = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const commonProps = {
    to: '/dashboard/meetings/create',
    state: getReferrerRouterState(window.location),
    component: Link,
  } as const;

  if (isMobile) {
    return (
      <CustomIconButton {...commonProps} aria-label={t('dashboard-plan-new-meeting')}>
        <AddIcon />
      </CustomIconButton>
    );
  }

  return (
    <CustomButton {...commonProps} size="large" startIcon={<AddIcon />}>
      {t('dashboard-plan-new-meeting')}
    </CustomButton>
  );
};
