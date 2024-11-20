// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { List as MuiList, ListItem as MuiListItem, ListItemText, styled, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { useAppSelector } from '../../../hooks';
import { useIsDesktop } from '../../../hooks/useMediaQuery';
import { selectDataProtectionUrl, selectImprintUrl, selectHelpdeskUrl } from '../../../store/slices/configSlice';

export interface SecondaryRoute {
  path: string;
  name: string;
}
interface NavigationProps {
  label: string;
  routes: Array<SecondaryRoute> | undefined;
  submenu: string | undefined;
  setActiveNavbar: (value: boolean) => void;
}

const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(13),
  background: theme.palette.secondary.lightest,
  padding: theme.spacing(4, 0),
  height: '100%',

  [theme.breakpoints.down('md')]: {
    width: '50vw',
  },
}));

const List = styled(MuiList)({
  display: 'flex',
  flexDirection: 'column',
});

const ListItem = styled(MuiListItem)(({ theme }) => ({
  padding: 0,

  '& .MuiListItemText-root': {
    padding: theme.spacing(1.5, 4),
  },
}));

const NavItem = styled(NavLink)(({ theme }) => ({
  color: theme.palette.text.primary,
  display: 'flex',
  background: 'transparent',
  textDecoration: 'none',
  textTransform: 'capitalize',
  width: '100%',
  position: 'relative',

  '&::after': {
    display: 'block',
    opacity: 0,
    width: '5px',
    height: `100%`,
    backgroundColor: theme.palette.secondary.dark,
    position: 'absolute',
    right: 0,
    top: 0,
    content: '""',
    borderRadius: `${theme.borderRadius.medium}px 0 0 ${theme.borderRadius.medium}px`,
  },

  '&.active': {
    fontWeight: '500',

    '&::after': {
      opacity: 1,
    },
  },
}));

const SecondaryNavigation = ({ label, routes, submenu, setActiveNavbar }: NavigationProps) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const imprintUrl = useAppSelector(selectImprintUrl);
  const dataProtectionUrl = useAppSelector(selectDataProtectionUrl);
  const helpdeskUrl = useAppSelector(selectHelpdeskUrl);

  const handleNavigation = (path: string) => {
    switch (path) {
      case 'imprint':
        window.open(imprintUrl, '_blank');
        break;
      case 'data-protection':
        window.open(dataProtectionUrl, '_blank');
        break;
      case 'support':
        window.open(helpdeskUrl, '_blank');
        break;
    }
    if (!isDesktop) {
      setActiveNavbar(false);
    }
  };

  const showSubmenuEntry = (path: string) => {
    if (path === 'imprint') {
      return Boolean(imprintUrl);
    }
    if (path === 'data-protection') {
      return Boolean(dataProtectionUrl);
    }
    if (path === 'support') {
      return Boolean(helpdeskUrl);
    }
    return true;
  };

  const NavItems = () => (
    <List>
      {routes &&
        routes
          .filter((route) => showSubmenuEntry(route.path))
          .map(({ path, name }) => (
            <ListItem key={path}>
              <NavItem
                to={`${submenu}/${path}`}
                onClick={() => handleNavigation(path)}
                data-testid="SecondaryNavItem"
                aria-controls="main-content-dashboard"
              >
                <ListItemText>{t(name)}</ListItemText>
              </NavItem>
            </ListItem>
          ))}
    </List>
  );

  return (
    <Container data-testid="SecondaryNavigation">
      {isDesktop && (
        <Typography variant="h1" variantMapping={{ h1: 'h2' }} color="secondary" ml={4} mr={4}>
          {t(label)}
        </Typography>
      )}
      <NavItems />
    </Container>
  );
};

export default SecondaryNavigation;
