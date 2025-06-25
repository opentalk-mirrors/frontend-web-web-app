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
  MenuItemProps,
  MenuList,
  MenuListProps,
  ThemeProvider,
  styled,
} from '@mui/material';
import { ListItemButtonProps } from '@mui/material';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  BugIcon,
  ExtendToTabIcon,
  KeyboardIcon,
  MenubookIcon,
  ContactIcon,
  AccessablityIcon,
} from '../../assets/icons';
import { createOpenTalkTheme } from '../../assets/themes/opentalk';
import { useAppSelector, useLocale } from '../../hooks';
import { selectContactSupportUrl, selectIsGlitchtipConfigured } from '../../store/slices/configSlice';
import { getAccessibilityUrl, USER_MANUAL_URL } from '../../utils/apiUtils';
import { triggerGlitchtipManually } from '../../utils/glitchtipUtils';
import ShortcutListDialog from '../Toolbar/fragments/ShortcutListDialog';

enum ListItemKeys {
  Accessibility = 'accessibility',
  UserManual = 'user-manual',
  KeyboardShortcuts = 'keyboard-shortcuts',
  GlitchtipTrigger = 'glitchtip-trigger',
  Support = 'support',
}

type AnchorItem = {
  key: ListItemKeys;
  name: string;
  icon: React.JSX.Element;
  componentProps: {
    href: string;
    target: '_blank';
  };
};

type ButtonItem = {
  key: ListItemKeys;
  name: string;
  icon: React.JSX.Element;
  componentProps: {
    onClick: () => void;
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
  const contactSupportUrl = useAppSelector(selectContactSupportUrl);
  const locale = useLocale();
  const accessibilityUrl = getAccessibilityUrl(locale);

  const items = useMemo(() => {
    const output: Item[] = [
      {
        key: ListItemKeys.Accessibility,
        name: 'my-meeting-menu-accessibility',
        icon: <AccessablityIcon />,
        componentProps: {
          href: accessibilityUrl,
          target: '_blank',
          onClick: () => {
            window.open(accessibilityUrl, '_blank');
          },
        },
      },
      {
        key: ListItemKeys.UserManual,
        name: 'my-meeting-menu-user-manual',
        icon: <MenubookIcon fontSize="small" />,
        componentProps: {
          href: USER_MANUAL_URL,
          target: '_blank',
          onClick: () => window.open(USER_MANUAL_URL, '_blank'),
        },
      },
      {
        key: ListItemKeys.KeyboardShortcuts,
        name: 'my-meeting-menu-keyboard-shortcuts',
        icon: <KeyboardIcon fontSize="small" />,
        componentProps: {
          onClick: () => {
            setIsShortcutListDialogOpen(!isShortcutListDialogOpen);
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
        },
      });
    }

    if (contactSupportUrl) {
      output.push({
        key: ListItemKeys.Support,
        name: 'my-meeting-menu-support',
        icon: <ContactIcon fontSize="small" />,
        componentProps: {
          href: contactSupportUrl,
          target: '_blank',
          onClick: () => window.open(contactSupportUrl, '_blank'),
        },
      });
    }

    return output;
  }, [isGlitchtipConfigured, isShortcutListDialogOpen, contactSupportUrl]);

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
            <MenuItem key={item.key} sx={{ width: '100%' }} disableGutters {...(item.componentProps as MenuItemProps)}>
              {icons && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText primary={t(item.name)} slotProps={{ primary: { textAlign: 'left' } }} />
              {renderEndAdornment(item)}
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
