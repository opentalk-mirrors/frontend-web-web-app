// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { LogoGradientIcon } from '../../assets/icons';

const StyledLogo = styled(LogoGradientIcon)({
  '&.MuiSvgIcon-root': {
    gridArea: 'Logo',
    height: '1.55rem',
    width: 'max-content',
    fontSize: '1rem',
  },
});

const DashboardLogo = () => {
  const { t } = useTranslation();
  return <StyledLogo type="functional" title={t('dashboard-logo-title')} titleId="dashboard-logo-title-id" />;
};

export default DashboardLogo;
