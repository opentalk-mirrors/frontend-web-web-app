// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { AddIcon } from '../../../../assets/icons';
import { useIsDesktop } from '../../../../hooks/useMediaQuery';
import getReferrerRouterState from '../../../../utils/getReferrerRouterState';

const NewMeetingButton = () => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  return (
    <Button
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
    </Button>
  );
};

export default NewMeetingButton;
