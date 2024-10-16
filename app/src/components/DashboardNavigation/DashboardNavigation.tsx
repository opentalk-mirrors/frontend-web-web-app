// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Collapse as CollapseMui, styled } from '@mui/material';
import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useIsMobile } from '../../hooks/useMediaQuery';
import MobileHeadbar from './fragments/MobileHeadbar';
import PrimaryNavigation from './fragments/PrimaryNavigation';
import { PrimaryRoute } from './fragments/PrimaryNavigationList';
import SecondaryNavigation, { SecondaryRoute } from './fragments/SecondaryNavigation';

interface DashboardProps {
  routes: Array<PrimaryRoute>;
}

const NavigationContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  width: '100%',
  overflow: 'auto',
  [theme.breakpoints.up('md')]: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridTemplateColumns: `1fr auto`,
    transition: 'all 300ms ease-out',
    alignItems: 'stretch',
    width: 'auto',
  },
}));

const NavContainer = styled('nav', {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>(({ theme, active }) => ({
  display: 'grid',
  gridAutoFlow: 'column',
  gridTemplateColumns: `1fr auto`,
  transition: 'all 300ms ease-out',
  height: '100%',

  [theme.breakpoints.down('md')]: {
    position: 'fixed',
    height: active ? 'calc(100vh - 56px)' : 0,
    width: '100%',
    overflow: 'hidden',
    zIndex: theme.zIndex.drawer,
  },
}));

const Collapse = styled(CollapseMui)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    entered: {
      width: '100%',
      height: '100%',
    },
  },
}));

const DashboardNavigation = ({ routes }: DashboardProps) => {
  const { pathname } = useLocation();
  const [activeNavbar, setActiveNavbar] = useState<boolean>(false);
  const [secondaryRoutes, setSecondaryRoutes] = useState<SecondaryRoute[] | undefined>();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const activeMenu = useMemo(() => {
    const path = pathname.split('/');
    // check if its home (/dashboard) which is path[1] or has other parent menu (path[2])
    // subroutes are not important here they are handled in activerRoutes -> secondaryRoutes
    return path[2] && path[2].length > 1 ? path[2] : path[1];
  }, [pathname]);

  const containsChildrens = (routeObject: Array<PrimaryRoute>) => {
    return routeObject[0]?.childRoutes && routeObject[0].childRoutes.length > 0;
  };
  const activeRoutes: Array<PrimaryRoute> = useMemo(() => {
    const currentRoute = routes.filter((route) => route.path === activeMenu) || [];
    if (containsChildrens(currentRoute)) {
      setSecondaryRoutes(currentRoute[0].childRoutes);
    }
    return currentRoute;
  }, [routes, activeMenu]);

  useEffect(() => {
    if (activeRoutes[0]?.childRoutes && !pathname.split('/')[3]) {
      navigate(`${activeRoutes[0].path}/${activeRoutes[0]?.childRoutes[0].path}`);
    }
  }, [navigate, activeRoutes, pathname]);

  return (
    <NavigationContainer>
      {isMobile && (
        <MobileHeadbar
          activeNavbar={activeNavbar}
          toggleNavbar={() => setActiveNavbar(!activeNavbar)}
          path={pathname}
        />
      )}
      <NavContainer active={activeNavbar}>
        <PrimaryNavigation submenu={activeMenu} setActiveNavbar={(e: boolean) => setActiveNavbar(e)} routes={routes} />
        <Collapse orientation="horizontal" in={containsChildrens(activeRoutes)} unmountOnExit mountOnEnter>
          <SecondaryNavigation
            label={`dashboard-${activeMenu}`}
            setActiveNavbar={(e: boolean) => setActiveNavbar(e)}
            routes={secondaryRoutes}
            submenu={activeMenu}
          />
        </Collapse>
      </NavContainer>
    </NavigationContainer>
  );
};

export default DashboardNavigation;
