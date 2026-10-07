// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface HighSecurityTooltipProps {
  children: React.ReactNode;
}

const HighSecurityTooltip = ({ children }: HighSecurityTooltipProps) => {
  const { t } = useTranslation();

  return (
    <Tooltip describeChild title={t('more-menu-high-security-tooltip')}>
      <span>{children}</span>
    </Tooltip>
  );
};

export default HighSecurityTooltip;
