// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { AddIcon } from '../../../../assets/icons';
import { useIsDesktop } from '../../../../hooks/useMediaQuery';
import getReferrerRouterState from '../../../../utils/getReferrerRouterState';

//Workaround for button focus outline not being fully visible on desktop
const CreateNewMeetingButton = styled(Button)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    margin: theme.spacing(0.5, 0.5, 0, 0),
  },
})) as typeof Button;

const NewMeetingButton = () => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  return (
    <CreateNewMeetingButton
      component={Link}
      to="/dashboard/meetings/create"
      startIcon={<AddIcon />}
      color="secondary"
      size="large"
      state={{
        ...getReferrerRouterState(window.location),
      }}
    >
      {isDesktop ? t('dashboard-plan-new-meeting') : t('dashboard-plan-new-meeting-mobile')}
    </CreateNewMeetingButton>
  );
};

export default NewMeetingButton;
