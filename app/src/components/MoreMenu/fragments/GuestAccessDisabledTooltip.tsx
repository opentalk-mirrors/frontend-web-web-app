// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface GuestAccessDisabledTooltipProps {
  children: React.ReactNode;
}

const GuestAccessDisabledTooltip = ({ children }: GuestAccessDisabledTooltipProps) => {
  const { t } = useTranslation();

  return (
    <Tooltip
      describeChild
      title={t('enable-guest-access-first')}
      placement="right"
      slotProps={{
        popper: {
          modifiers: [{ name: 'offset', options: { offset: [0, -14] } }],
        },
      }}
    >
      <span>{children}</span>
    </Tooltip>
  );
};

export default GuestAccessDisabledTooltip;
