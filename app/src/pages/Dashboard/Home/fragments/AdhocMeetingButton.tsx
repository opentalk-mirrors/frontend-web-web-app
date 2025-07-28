// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { CameraOnIcon } from '../../../../assets/icons';
import { useIsDesktop } from '../../../../hooks/useMediaQuery';
import getReferrerRouterState from '../../../../utils/getReferrerRouterState';

interface AdhocMeetingButtonProps {
  onHover?: (hovered: boolean) => void;
}

const AdhocMeetingButton = (props: AdhocMeetingButtonProps) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const { onHover } = props;

  return (
    <Button
      component={Link}
      to="/dashboard/meetings/meet-now"
      onMouseEnter={() => onHover && onHover(true)}
      onMouseLeave={() => onHover && onHover(false)}
      startIcon={<CameraOnIcon />}
      size="large"
      color="secondary"
      fullWidth={isDesktop}
      state={{
        ...getReferrerRouterState(window.location),
      }}
    >
      {isDesktop ? t('dashboard-adhoc-meeting-button-title') : t('dashboard-adhoc-meeting-button-title-mobile')}
    </Button>
  );
};

export default AdhocMeetingButton;
