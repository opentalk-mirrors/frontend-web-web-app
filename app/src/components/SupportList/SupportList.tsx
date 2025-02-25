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
  styled,
} from '@mui/material';
import { ListItemButtonProps } from '@mui/material';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BugIcon, HelpIcon, HelpSquareIcon, ExtendToTabIcon } from '../../assets/icons';
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
  componentProps: {
    href: string;
    target: '_blank';
  };
};

type ButtonItem = {
  key: ListItemKeys;
  name: string;
  icon: JSX.Element;
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

const StyledExtendToTabIcon = styled(ExtendToTabIcon)(({ theme }) => ({
  '&.MuiSvgIcon-root': {
    color: theme.palette.text.disabled,
  },
}));

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
        componentProps: {
          href: USER_MANUAL_URL,
          target: '_blank',
        },
      },
      {
        key: ListItemKeys.KeyboardShortcuts,
        name: 'my-meeting-menu-keyboard-shortcuts',
        icon: <HelpSquareIcon fontSize="small" />,
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

  const willOpenNewTab = (item: Item) => {
    return 'target' in item.componentProps && item.componentProps.target === '_blank';
  };

  const renderEndAdornment = (item: Item) => {
    if (willOpenNewTab(item)) {
      return (
        <StyledExtendToTabIcon
          fontSize="small"
          type="functional"
          titleId={item.key + '-new-tab'}
          title={t('global-open-new-tab')}
        />
      );
    }
  };

  if (menu) {
    return (
      <>
        <MenuList {...menuListProps} className={className}>
          {items.map((item) => (
            <MenuItem key={item.key} sx={{ width: '100%' }}>
              <ListItemButton disableGutters {...(item.componentProps as ListItemButtonProps)}>
                {icons && <ListItemIcon>{item.icon}</ListItemIcon>}
                <ListItemText primary={t(item.name)} slotProps={{ primary: { textAlign: 'left' } }} />
                {renderEndAdornment(item)}
              </ListItemButton>
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
            <ListItemButton disableGutters {...(item.componentProps as ListItemButtonProps)}>
              {icons && <ListItemIcon sx={{ minWidth: '2.25rem' }}>{item.icon}</ListItemIcon>}
              <ListItemText primary={t(item.name)} />
              {renderEndAdornment(item)}
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
