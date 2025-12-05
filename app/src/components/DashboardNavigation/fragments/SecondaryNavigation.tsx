// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { List as MuiList, ListItem as MuiListItem, ListItemText, styled, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { useAppSelector } from '../../../hooks';
import { useIsDesktop } from '../../../hooks/useMediaQuery';
import { selectDataProtectionUrl, selectImprintUrl, selectHelpdeskUrl } from '../../../store/slices/configSlice';
import { USER_MANUAL_URL } from '../../../utils/apiUtils';

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
  background: theme.palette.background.highlight.primary,
  color: theme.palette.background.highlight.contrastText,
  padding: theme.spacing(4, 0),
  marginRight: theme.spacing(0.5),
  height: '100%',

  [theme.breakpoints.down('md')]: {
    width: '50vw',
  },
}));

const List = styled(MuiList)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingRight: 0,
  gap: theme.spacing(1),
}));

const ListItem = styled(MuiListItem)(({ theme }) => ({
  padding: 0,

  '& .MuiListItemText-root': {
    padding: theme.spacing(1.5, 4),
  },
}));

const NavItem = styled(NavLink)(({ theme, target }) => ({
  background: theme.palette.background.highlight.primary,
  color: theme.palette.background.highlight.contrastText,
  display: 'flex',
  textDecoration: 'none',
  textTransform: 'capitalize',
  width: '100%',
  position: 'relative',

  '&::after': {
    display: target === '_self' ? 'block' : 'none',
    opacity: 0,
    width: '5px',
    height: `100%`,
    backgroundColor: theme.palette.primary.main,
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

  '&:hover': {
    background: theme.palette.background.highlightContrast.primary,
  },

  '&:focus-visible': {
    outline: theme.palette.focus.outline,
  },
}));

const SecondaryNavigation = ({ label, routes, submenu, setActiveNavbar }: NavigationProps) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const imprintUrl = useAppSelector(selectImprintUrl);
  const dataProtectionUrl = useAppSelector(selectDataProtectionUrl);
  const helpdeskUrl = useAppSelector(selectHelpdeskUrl);

  const getTarget = (path: string) => {
    switch (path) {
      case 'imprint':
      case 'data-protection':
      case 'support':
      case 'user-manual':
        return '_blank';
      default:
        return '_self';
    }
  };

  const getUrl = (path: string): string => {
    switch (path) {
      case 'imprint':
        return imprintUrl ?? '';
      case 'data-protection':
        return dataProtectionUrl ?? '';
      case 'support':
        return helpdeskUrl ?? '';
      case 'user-manual':
        return USER_MANUAL_URL ?? '';
      default:
        return '';
    }
  };

  const handleNavigation = () => {
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

  const getHref = (submenu: string | undefined, path: string, target: string) =>
    target === '_blank' ? getUrl(path) : `${submenu}/${path}`;

  return (
    <Container data-testid="SecondaryNavigation">
      {isDesktop && (
        <Typography
          variant="h1"
          color="inherit"
          sx={{
            ml: 4,
            mr: 4,
          }}
          fontWeight={700}
        >
          {t(label)}
        </Typography>
      )}
      <List>
        {routes &&
          routes
            .filter((route) => showSubmenuEntry(route.path))
            .map(({ path, name }) => {
              const target = getTarget(path);

              return (
                <ListItem key={path}>
                  <NavItem
                    to={getHref(submenu, path, target)}
                    onClick={handleNavigation}
                    data-testid="SecondaryNavItem"
                    aria-controls={target === '_self' ? 'main-content-dashboard' : undefined}
                    target={target}
                  >
                    <ListItemText>{t(name)}</ListItemText>
                  </NavItem>
                </ListItem>
              );
            })}
      </List>
    </Container>
  );
};

export default SecondaryNavigation;
