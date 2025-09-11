// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { LogoIcon } from '../../assets/icons';

const StyledLogo = styled(LogoIcon)(({ theme }) => ({
  '&.MuiSvgIcon-root': {
    gridArea: 'Logo',
    height: '2rem',
    width: 'max-content',
    fontSize: '1rem',
    color: theme.palette.background.main.contrastText,
  },
}));

const DashboardLogo = () => {
  const { t } = useTranslation();
  return <StyledLogo type="functional" title={t('dashboard-logo-title')} titleId="dashboard-logo-title-id" />;
};

export default DashboardLogo;
