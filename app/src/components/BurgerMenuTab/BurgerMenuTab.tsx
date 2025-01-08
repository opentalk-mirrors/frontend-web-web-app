// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ThemeProvider } from '@emotion/react';
import { List, ListItem, Stack, styled } from '@mui/material';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  component: 'a';
  componentProps: {
    href: string;
    target: '_blank';
  };
};

type ButtonItem = {
  key: ListItemKeys;
  name: string;
  component: 'button';
  componentProps: {
    onClick: () => void;
    'aria-expanded'?: boolean;
  };
};

type Item = AnchorItem | ButtonItem;

const CustomListItem = styled(ListItem)<{
  component: 'a' | 'button';
}>(({ theme }) => ({
  appearance: 'unset',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'inline-block',
  fontWeight: 'normal',
  fontFamily: 'Opentalk, serif',
  color: theme.palette.text.primary,
}));

const BurgerMenuTab = () => {
  const { t } = useTranslation();
  const isGlitchtipConfigured = useAppSelector(selectIsGlitchtipConfigured);
  const [isShortcutListDialogOpen, setIsShortcutListDialogOpen] = useState(false);

  const items = useMemo(() => {
    const output: Item[] = [
      {
        key: ListItemKeys.UserManual,
        name: 'my-meeting-menu-user-manual',
        component: 'a',
        componentProps: {
          href: USER_MANUAL_URL,
          target: '_blank',
        },
      },
      {
        key: ListItemKeys.KeyboardShortcuts,
        name: 'my-meeting-menu-keyboard-shortcuts',
        component: 'button',
        componentProps: {
          onClick: () => setIsShortcutListDialogOpen(true),
          'aria-expanded': isShortcutListDialogOpen,
        },
      },
    ];

    if (isGlitchtipConfigured) {
      output.push({
        key: ListItemKeys.GlitchtipTrigger,
        name: 'my-meeting-menu-glitchtip-trigger',
        component: 'button',
        componentProps: {
          onClick: triggerGlitchtipManually,
        },
      });
    }

    return output;
  }, [isGlitchtipConfigured, isShortcutListDialogOpen]);

  return (
    <div>
      <Stack component={List} alignItems="flex-start">
        {items.map((item) => (
          <CustomListItem key={item.key} component={item.component} {...item.componentProps} role="listitem">
            {t(item.name)}
          </CustomListItem>
        ))}
      </Stack>
      <ThemeProvider theme={createOpenTalkTheme()}>
        <ShortcutListDialog open={isShortcutListDialogOpen} onClose={() => setIsShortcutListDialogOpen(false)} />
      </ThemeProvider>
    </div>
  );
};

export default BurgerMenuTab;
