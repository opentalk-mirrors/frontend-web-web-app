// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Collapse, ListItemText } from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';

import { useIsDesktop } from '../../../hooks/useMediaQuery';
import { ListItem } from './PrimaryNavigationEntry';
import { SecondaryRoute } from './SecondaryNavigation';

export enum FilterMode {
  Include = 'include',
  Exclude = 'exclude',
}

export interface PrimaryRoute {
  icon: ReactNode;
  path: string;
  name: string;
  childRoutes?: Array<SecondaryRoute>;
}

interface NavigationProps {
  filter: {
    value: string;
    mode: FilterMode;
  };
  submenu: string;
  routes: Array<PrimaryRoute>;
  collapsedBar: boolean;
  setActiveNavbar: (value: boolean) => void;
}

const PrimaryNavigationList = ({ collapsedBar, filter, submenu, routes, setActiveNavbar }: NavigationProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const handleNavigation = (event: React.MouseEvent, hasSubmenu: boolean, path: string) => {
    if (hasSubmenu) {
      event.preventDefault();
      navigate(`/dashboard/${path}`);
      return;
    }
    // if menu doesn't contain child close it on mobile
    if (!isDesktop) {
      setActiveNavbar(false);
    }
  };

  const list =
    filter.mode === FilterMode.Include
      ? routes.filter((route) => route.path === filter.value)
      : routes.filter((route) => route.path !== filter.value);

  const getNavitaionList = list.map(({ path, name, icon, childRoutes }) => {
    const hasSubmenu = childRoutes ? childRoutes.length > 0 : false;
    return (
      <ListItem key={path} isSubmenuOpen={path.includes(submenu) && hasSubmenu}>
        <NavLink
          onClick={(event) => handleNavigation(event, hasSubmenu, path)}
          to={path}
          data-testid="PrimaryNavItem"
          className={path.includes(submenu) ? 'active-link' : ''}
          aria-controls={hasSubmenu ? 'secondary-navigation-dashboard' : 'main-content-dashboard'}
        >
          {icon}
          <Collapse orientation="horizontal" in={!collapsedBar}>
            <ListItemText>{t(name)}</ListItemText>
          </Collapse>
        </NavLink>
      </ListItem>
    );
  });

  return <>{getNavitaionList}</>;
};

export default PrimaryNavigationList;
