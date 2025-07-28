// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

import getReferrerRouterState from '../../../../utils/getReferrerRouterState';

/**
 * ButtonBack component is used as a part of the larger component eventually
 * building up page under the path `/dashboard/meetings/:meeting_id`.
 *
 * Following breadcrumb logic, back button in the page context should get us
 * back to the page from which we could see rendered page, in this case `/dashboard/meetings`.
 *
 */
const ButtonBack = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  function onClick() {
    const FALLBACK_LOCATION = '/dashboard/meetings';
    navigate(location.state?.referrer || FALLBACK_LOCATION, {
      replace: false,
      state: { ...getReferrerRouterState(window.location) },
    });
  }

  return (
    <Button onClick={onClick} variant="outlined" type="button">
      {t('button-back-messages')}
    </Button>
  );
};

export default ButtonBack;
