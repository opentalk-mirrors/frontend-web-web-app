// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListProps,
  MenuItem,
  MenuList,
  MenuListProps,
  ThemeProvider,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BugIcon, HelpIcon, HelpSquareIcon } from '../../assets/icons';
import { createOpenTalkTheme } from '../../assets/themes/opentalk';
import { useAppSelector } from '../../hooks';
import { selectIsGlitchtipConfigured } from '../../store/slices/configSlice';
import { USER_MANUAL_URL } from '../../utils/apiUtils';
import { triggerGlitchtipManually } from '../../utils/glitchtipUtils';
import ShortcutListDialog from '../Toolbar/fragments/ShortcutListDialog';

enum ListItemKeys {
  UserManual = 'user-manual',
  KeyboardShortcuts = 'keyboard-shortcuts',
  GlitchtipTrigger = 'glitchtip-trigger',
}

type AnchorItem = {
  key: ListItemKeys;
  name: string;
  icon: JSX.Element;
  component: 'a';
  componentProps: {
    href: string;
    target: '_blank';
  };
};

type ButtonItem = {
  key: ListItemKeys;
  name: string;
  icon: JSX.Element;
  component: 'button';
  componentProps: {
    onClick: () => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
    onKeyUp?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
    'aria-expanded'?: boolean;
  };
};

type Item = AnchorItem | ButtonItem;

type SupportListProps = {
  icons?: boolean;
  listProps?: ListProps;
  menuListProps?: MenuListProps;
  className?: string;
  menu?: boolean;
};

export const SupportList = ({
  icons = false,
  listProps = {},
  menuListProps = {},
  className,
  menu = false,
}: SupportListProps) => {
  const { t } = useTranslation();
  const isGlitchtipConfigured = useAppSelector(selectIsGlitchtipConfigured);
  const [isShortcutListDialogOpen, setIsShortcutListDialogOpen] = useState(false);

  const items = useMemo(() => {
    const output: Item[] = [
      {
        key: ListItemKeys.UserManual,
        name: 'my-meeting-menu-user-manual',
        icon: <HelpIcon fontSize="small" />,
        component: 'a',
        componentProps: {
          href: USER_MANUAL_URL,
          target: '_blank',
        },
      },
      {
        key: ListItemKeys.KeyboardShortcuts,
        name: 'my-meeting-menu-keyboard-shortcuts',
        icon: <HelpSquareIcon fontSize="small" />,
        component: 'button',
        componentProps: {
          onClick: () => {
            setIsShortcutListDialogOpen(!isShortcutListDialogOpen);
          },
          onKeyDown: (event) => {
            if (event.code === 'Space') {
              event.stopPropagation();
            }
          },
          onKeyUp: (event) => {
            if (event.code === 'Space') {
              event.stopPropagation();
            }
          },
          'aria-expanded': isShortcutListDialogOpen,
        },
      },
    ];

    if (isGlitchtipConfigured) {
      output.push({
        key: ListItemKeys.GlitchtipTrigger,
        name: 'my-meeting-menu-glitchtip-trigger',
        icon: <BugIcon fontSize="small" />,
        component: 'button',
        componentProps: {
          onClick: triggerGlitchtipManually,
          onKeyDown: (event) => {
            if (event.code === 'Space') {
              event.stopPropagation();
            }
          },
          onKeyUp: (event) => {
            if (event.code === 'Space') {
              event.stopPropagation();
            }
          },
        },
      });
    }

    return output;
  }, [isGlitchtipConfigured, isShortcutListDialogOpen]);

  if (menu) {
    return (
      <>
        <MenuList {...menuListProps} className={className}>
          {items.map((item) => (
            <MenuItem key={item.key} component={item.component} {...item.componentProps} sx={{ width: '100%' }}>
              {icons && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText primary={t(item.name)} slotProps={{ primary: { textAlign: 'left' } }} />
            </MenuItem>
          ))}
        </MenuList>
        <ThemeProvider theme={createOpenTalkTheme()}>
          <ShortcutListDialog open={isShortcutListDialogOpen} onClose={() => setIsShortcutListDialogOpen(false)} />
        </ThemeProvider>
      </>
    );
  }

  return (
    <>
      <List className={className} {...listProps}>
        {items.map((item) => (
          <ListItem key={item.key} sx={{ padding: '0 0.5rem' }}>
            <ListItemButton disableGutters component={item.component} {...item.componentProps}>
              {icons && <ListItemIcon sx={{ minWidth: '2.25rem' }}>{item.icon}</ListItemIcon>}
              <ListItemText primary={t(item.name)} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <ThemeProvider theme={createOpenTalkTheme()}>
        <ShortcutListDialog open={isShortcutListDialogOpen} onClose={() => setIsShortcutListDialogOpen(false)} />
      </ThemeProvider>
    </>
  );
};
