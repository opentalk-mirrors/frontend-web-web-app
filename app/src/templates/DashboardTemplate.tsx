// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Container as MuiContainer, Grid, Paper, Skeleton, Stack, styled } from '@mui/material';
import { selectIsAuthenticated } from '@opentalk/redux-oidc';
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

import {
  HomeIcon,
  SettingsIcon,
  MeetingsIcon,
  MyAccountIcon,
  DashboardLegalIcon,
  HelpSquareIcon,
} from '../assets/icons';
import Logo from '../assets/images/logoGradient.svg?react';
import DashboardNavigation, { PrimaryRoute } from '../components/DashboardNavigation';
import { useAppSelector } from '../hooks';
import { useIsDesktop } from '../hooks/useMediaQuery';
import { selectIsProviderActive } from '../store/slices/configSlice';
import BrowserCompatibilityInfo from './fragments/BrowserCompatibilityInfo';

const DashboardLogo = styled(Logo)({
  gridArea: 'Logo',
  height: '1.685em',
  width: '100%',
});

const Main = styled('main')(({ theme }) => ({
  height: '100%',
  flex: 1,
  padding: theme.spacing(3, 5),

  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3, 2),
  },
}));

const Container = styled(MuiContainer)(({ theme }) => ({
  background: theme.palette.common.white,
  width: '100%',
  '&::before': {
    position: 'absolute',
    inset: 0,
    content: "''",
    background: theme.palette.background?.defaultGradient || theme.palette.background?.default,
    backgroundColor: theme.palette.background?.defaultGradient || theme.palette.background?.default,
    pointerEvents: 'none',
  },
}));

const LoadingNavbarContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 256,
}));

const MainStack = styled(Stack)(({ theme }) => ({
  maxHeight: '100%',
  height: 0,
  [theme.breakpoints.up('md')]: {
    height: '100%',
  },
})) as typeof Stack;

const getRoutes = (useProviderSettings: boolean) => {
  const routes: Array<PrimaryRoute> = [
    {
      icon: <HomeIcon />,
      path: '/dashboard/',
      name: 'dashboard-home',
    },
    {
      icon: <MeetingsIcon />,
      path: 'meetings',
      name: 'dashboard-meetings',
    },
    {
      icon: <HelpSquareIcon />,
      path: 'help',
      name: 'dashboard-help',
      childRoutes: [
        {
          path: 'user-manual',
          name: 'dashboard-help-user-manual',
        },
        {
          path: 'support',
          name: 'dashboard-help-support',
        },
      ],
    },
  ];

  if (useProviderSettings) {
    const providerMenu = {
      icon: <MyAccountIcon />,
      path: 'settings',
      name: 'dashboard-my-profile',
      childRoutes: [
        {
          path: 'profile',
          name: 'dashboard-settings-profile',
        },
      ],
    };
    routes.push(providerMenu);
  } else {
    const communityUsers = {
      icon: <SettingsIcon />,
      path: 'settings',
      name: 'dashboard-settings',
      childRoutes: [
        {
          path: 'general',
          name: 'dashboard-settings-general',
        },
        {
          path: 'profile',
          name: 'dashboard-settings-profile',
        },
        {
          path: 'account',
          name: 'dashboard-settings-account',
        },
        {
          path: 'storage',
          name: 'dashboard-settings-storage',
        },
      ],
    };
    routes.push(communityUsers);
  }

  const legalLinks = {
    icon: <DashboardLegalIcon />,
    path: 'legal',
    name: 'dashboard-legal',
    childRoutes: [
      {
        path: 'imprint',
        name: 'dashboard-legal-imprint',
      },
      {
        path: 'data-protection',
        name: 'dashboard-legal-data-protection',
      },
    ],
  };
  routes.push(legalLinks);

  return routes;
};

const DashboardTemplate = () => {
  const [header, setHeader] = useState<React.ReactNode>();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isDesktop = useIsDesktop();
  const isProviderActive = useAppSelector(selectIsProviderActive);

  if (!isAuthenticated) {
    return (
      <BrowserCompatibilityInfo>
        <Container maxWidth={false} disableGutters>
          <Stack direction={{ xs: 'column', md: 'row' }} height="100%">
            {isDesktop && (
              <LoadingNavbarContainer elevation={0}>
                <Stack spacing={12}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item>
                      <Skeleton variant="circular" width={40} height={40} />
                    </Grid>
                    <Grid item xs>
                      <Skeleton variant="text" />
                    </Grid>
                  </Grid>
                  <Stack spacing={1}>
                    <Skeleton variant="text" width={208} height={56} />
                    <Skeleton variant="text" width={208} height={56} />
                    <Skeleton variant="text" width={208} height={56} />
                    <Skeleton variant="text" width={208} height={56} />
                    <Skeleton variant="text" width={208} height={56} />
                    <Skeleton variant="text" width={208} height={56} />
                  </Stack>
                </Stack>
              </LoadingNavbarContainer>
            )}
            <Main>
              <Grid container spacing={4}>
                <Grid item>
                  <DashboardLogo />
                </Grid>
              </Grid>
              <div>
                <Stack spacing={2}>
                  <Skeleton variant="text" />
                  <Skeleton />
                  <Skeleton variant="rectangular" width="100%" height={400} />
                </Stack>
              </div>
            </Main>
          </Stack>
        </Container>
      </BrowserCompatibilityInfo>
    );
  }
  return (
    <BrowserCompatibilityInfo>
      <Container maxWidth={false} disableGutters>
        <Stack direction={{ xs: 'column', md: 'row' }} height="100%">
          <DashboardNavigation routes={getRoutes(isProviderActive)} />
          <MainStack component={Main} spacing={{ xs: 2, md: 5 }} id="main-content-dashboard">
            {isDesktop && (
              <Grid spacing={2} container direction="row" alignItems="center" justifyContent="space-between">
                <Grid item alignSelf="flex-end">
                  <DashboardLogo />
                </Grid>
                <Grid item xs>
                  {header}
                </Grid>
              </Grid>
            )}
            <Outlet context={{ setHeader }} />
          </MainStack>
        </Stack>
      </Container>
    </BrowserCompatibilityInfo>
  );
};

export default DashboardTemplate;
