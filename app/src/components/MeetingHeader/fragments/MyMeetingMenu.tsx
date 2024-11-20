// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  ListItemIcon,
  MenuItem as MuiMenuItem,
  MenuList as MuiMenuList,
  Popover,
  Stack,
  styled,
  useMediaQuery,
  useTheme,
  ThemeProvider,
} from '@mui/material';
import { useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { BurgermenuIcon, HelpIcon, MeetingNotesIcon, HelpSquareIcon, BugIcon } from '../../../assets/icons';
import { createOpenTalkTheme } from '../../../assets/themes/opentalk';
import { IconButton } from '../../../commonComponents';
import { MY_MEETING_MENU_BUTTON_ID } from '../../../constants';
import { useAppSelector } from '../../../hooks';
import { selectIsGlitchtipConfigured } from '../../../store/slices/configSlice';
import { triggerGlitchtipManually } from '../../../utils/glitchtipUtils';
import QuickStartPopover from '../../QuickStartPopover/QuickStartPopover';
import ShortcutListDialog from '../../Toolbar/fragments/ShortcutListDialog';

const ViewPopperContainer = styled(Stack)(({ theme }) => ({
  position: 'relative',
  background: theme.palette.background.video,
  borderRadius: '0.25rem',
  maxWidth: '60px',
  float: 'right',
  justifyContent: 'center',
  alignItems: 'center',
  '& .MuiPopover-paper': {
    marginTop: '0.3rem',
    background: theme.palette.background.defaultGradient,
  },
}));

const StyledPopover = styled(Popover)(() => ({
  marginTop: '5px',
}));

const BurgerIconButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(1, 1, 0, 2),
  '& .MuiSvgIcon-root': {
    fontSize: theme.typography.pxToRem(30),
  },
}));

const MenuList = styled(MuiMenuList)(({ theme }) => ({
  background: theme.palette.background.video,
}));

const MenuItem = styled(MuiMenuItem, {
  shouldForwardProp: (prop) => prop !== 'hasIndicator',
})<{ hasIndicator?: boolean }>(({ theme, hasIndicator }) => ({
  padding: theme.spacing(1),
  '& .MuiListItemIcon-root .MuiSvgIcon-root': {
    position: 'relative',
    fontSize: theme.typography.pxToRem(20),
    [theme.breakpoints.down('md')]: {
      fontSize: theme.typography.pxToRem(20),
    },
  },
  '&:after': {
    content: '""',
    display: hasIndicator ? 'block' : 'none',
    width: '0.5rem',
    height: '0.5rem',
    background: theme.palette.primary.main,
    borderRadius: '50%',
    marginLeft: '0.5rem',
  },
}));

enum MenuItemsKey {
  QuickStart = 'quick-start',
  KeyboardShortcuts = 'keyboard-shortcuts',
  GlitchtipTrigger = 'glitchtip-trigger',
}

interface MenuItemProps {
  key: MenuItemsKey;
  name: string;
  icon: JSX.Element;
  onClick: () => void;
}

const MyMeetingMenu = () => {
  const { t } = useTranslation();
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const isMenuOpen = Boolean(anchorElement);
  const [activeMenu, setActiveMenu] = useState<MenuItemsKey | null>(null);
  const isGlitchtipConfigured = useAppSelector(selectIsGlitchtipConfigured);

  const myMeetingMenuRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const menuItems: Array<MenuItemProps> = useMemo(() => {
    const items: Array<MenuItemProps> = [
      {
        key: MenuItemsKey.QuickStart,
        name: 'my-meeting-menu-quick-guide',
        icon: <HelpIcon />,
        onClick: () => {
          setAnchorElement(null);
          setActiveMenu(MenuItemsKey.QuickStart);
        },
      },
      {
        key: MenuItemsKey.KeyboardShortcuts,
        name: 'my-meeting-menu-keyboard-shortcuts',
        icon: <HelpSquareIcon />,
        onClick: () => {
          setAnchorElement(null);
          setActiveMenu(MenuItemsKey.KeyboardShortcuts);
        },
      },
    ];

    if (isGlitchtipConfigured) {
      items.push({
        key: MenuItemsKey.GlitchtipTrigger,
        name: 'my-meeting-menu-glitchtip-trigger',
        icon: <BugIcon />,
        onClick: () => {
          setAnchorElement(null);
          triggerGlitchtipManually();
        },
      });
    }

    return items;
  }, []);

  return (
    <>
      <ViewPopperContainer ref={myMeetingMenuRef}>
        <BurgerIconButton
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
          id={MY_MEETING_MENU_BUTTON_ID}
          aria-controls={isMenuOpen ? 'my-meeting-menu' : undefined}
          aria-label={t('my-meeting-menu')}
          onClick={(event) => setAnchorElement(event.currentTarget)}
          onKeyDown={(event) => {
            event.stopPropagation();
          }}
          onKeyUp={(event) => {
            event.stopPropagation();
          }}
        >
          <BurgermenuIcon />
        </BurgerIconButton>
        <StyledPopover
          open={isMenuOpen}
          anchorEl={anchorElement}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          onClose={() => setAnchorElement(null)}
        >
          <MenuList id="my-meeting-menu" autoFocusItem={isMenuOpen} aria-labelledby={MY_MEETING_MENU_BUTTON_ID}>
            {menuItems.map((menu) => (
              <MenuItem
                key={menu.key}
                onClick={menu.onClick}
                onKeyDown={(event) => {
                  if (event.code === 'Space') {
                    event.stopPropagation();
                  }
                }}
                onKeyUp={(event) => {
                  if (event.code === 'Space') {
                    event.stopPropagation();
                  }
                }}
              >
                <ListItemIcon aria-hidden={true}>{menu.icon}</ListItemIcon>
                {t(menu.name)}
              </MenuItem>
            ))}
            {isMobile && (
              <MenuItem>
                <ListItemIcon aria-hidden={true}>
                  <MeetingNotesIcon />
                </ListItemIcon>
              </MenuItem>
            )}
          </MenuList>
        </StyledPopover>
      </ViewPopperContainer>
      <ThemeProvider theme={createOpenTalkTheme()}>
        <ShortcutListDialog open={activeMenu === MenuItemsKey.KeyboardShortcuts} onClose={() => setActiveMenu(null)} />
        <QuickStartPopover
          onClose={() => setActiveMenu(null)}
          open={activeMenu === MenuItemsKey.QuickStart}
          variant="room"
          anchorEl={myMeetingMenuRef.current}
        />
      </ThemeProvider>
    </>
  );
};

export default MyMeetingMenu;
