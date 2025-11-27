// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, styled, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { CloseIcon, MoreIcon } from '../../../assets/icons';
import ProfileChip from './ProfileChip';

interface HeadbarProps {
  activeNavbar: boolean;
  toggleNavbar: () => void;
  path: string;
}

const HeadbarWrapper = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: `auto 1fr auto`,
  background: theme.palette.background.customPaper.primary,
  color: theme.palette.background.customPaper.contrastText,
  alignItems: 'center',
  padding: theme.spacing(1, 2),

  '& svg': {
    fill: theme.palette.background.customPaper.contrastText,
    height: 24,
    width: 24,
  },
}));

const SideContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  width: 32,

  '& .MuiAvatar-circular': {
    transform: 'scale(0.8)',
  },
});

const ToggleButton = styled(Button)({
  padding: 0,
});

const MobileHeadbar = ({ activeNavbar, toggleNavbar, path }: HeadbarProps) => {
  const { t } = useTranslation();
  const currentPage = path.replace(/\//g, '').replace('dashboard', '');

  const getTitle = () => {
    let explicitPage = currentPage;

    if (currentPage === '') {
      explicitPage = 'home';
    }

    //TODO: Look into using react router for the whole dashboard instead of the routes object
    if (currentPage.includes('meetings')) {
      if (currentPage.includes('create')) {
        explicitPage = 'meetings-create';
      } else if (currentPage.includes('update')) {
        explicitPage = 'meetings-update';
      } else {
        explicitPage = 'meetings';
      }
    }

    if (currentPage.includes('settings')) {
      explicitPage = 'settings';
    }

    if (currentPage.includes('legal')) {
      explicitPage = 'legal';
    }

    if (currentPage.includes('help')) {
      explicitPage = 'help';
    }

    return t(`dashboard-${explicitPage}`);
  };

  return (
    <HeadbarWrapper>
      <SideContainer>
        <ProfileChip collapsed={true} />
      </SideContainer>
      <Typography
        variant="h1"
        sx={{
          textAlign: 'center',
          textTransform: 'capitalize',
        }}
      >
        {getTitle()}
      </Typography>
      <SideContainer>
        {!activeNavbar ? (
          <ToggleButton variant="text" onClick={toggleNavbar} aria-label={t(`dashboard-open-navbar`)}>
            <MoreIcon />
          </ToggleButton>
        ) : (
          <ToggleButton variant="text" onClick={toggleNavbar} aria-label={t(`dashboard-close-navbar`)}>
            <CloseIcon />
          </ToggleButton>
        )}
      </SideContainer>
    </HeadbarWrapper>
  );
};

export default MobileHeadbar;
