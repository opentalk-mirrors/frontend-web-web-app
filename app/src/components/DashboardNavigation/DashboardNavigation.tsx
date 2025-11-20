// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Collapse as CollapseMui, styled } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
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
  '& .MuiCollapse-horizontal': {
    textWrap: 'noWrap',
  },
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
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const pathSegments = useMemo(() => pathname.split('/'), [pathname]);

  const activeMenu = useMemo(() => {
    // check if its home (/dashboard) which is path[1] or has other parent menu (path[2])
    // subroutes are not important here they are handled in activeRoutes -> secondaryRoutes
    return pathSegments[2] && pathSegments[2].length > 1 ? pathSegments[2] : pathSegments[1];
  }, [pathSegments]);

  const activeRoute = useMemo(() => {
    return routes.find((route) => route.path === activeMenu);
  }, [routes, activeMenu]);
  const secondaryRoutes: SecondaryRoute[] | undefined = activeRoute?.childRoutes;
  const hasSecondaryRoutes = Boolean(secondaryRoutes?.length);
  const primaryPath = activeRoute?.path;
  const defaultSecondaryPath = secondaryRoutes?.[0]?.path;

  useEffect(() => {
    if (hasSecondaryRoutes && !pathSegments[3] && primaryPath && defaultSecondaryPath) {
      navigate(`${primaryPath}/${defaultSecondaryPath}`);
    }
  }, [navigate, pathSegments, hasSecondaryRoutes, primaryPath, defaultSecondaryPath]);

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
        <Collapse
          orientation="horizontal"
          in={hasSecondaryRoutes}
          unmountOnExit
          mountOnEnter
          id="secondary-navigation-dashboard"
        >
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
