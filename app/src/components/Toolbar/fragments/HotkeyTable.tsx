// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Paper, Stack, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { hotkeys } from '../../../store/slices/hotkeys/listener';
import type { Hotkey } from '../../../store/slices/hotkeys/types';

type Hotkeys = Hotkey[];

const HotkeyTable = () => {
  const { t } = useTranslation();

  const renderHotkeys = (hotkeys: Hotkeys) =>
    hotkeys.map((hotkey) => {
      const key = hotkey.key === ' ' ? t('global-spacebar') : hotkey.key.toUpperCase();
      const modifiers = hotkey.modifier ? [hotkey.modifier].flat() : [];
      const translatedModifiers = modifiers.map((modifier) => t(`modifier-${modifier.toLowerCase()}`));
      const keyCombination = [...translatedModifiers, key].join(' + ');

      return (
        <TableRow key={`${modifiers.join('+')}+${hotkey.key}`}>
          <TableCell headers="shortcut-key" width="35%">
            <code>{keyCombination}</code>
          </TableCell>
          <TableCell headers="shortcut-description">
            <Typography fontWeight="300">{t(hotkey.descriptionKey)}</Typography>
          </TableCell>
        </TableRow>
      );
    });

  const groupedHotkeys = hotkeys.reduce<{
    push2talk: Hotkeys;
    toggle: Hotkeys;
  }>(
    (acc, hotkey) => {
      if (hotkey.onRelease) {
        acc.push2talk.push(hotkey);
      } else {
        acc.toggle.push(hotkey);
      }
      return acc;
    },
    { push2talk: [], toggle: [] }
  );

  const renderTable = (title: string, hotkeys: Hotkeys) => (
    <Stack>
      <Typography component="h3">{title}</Typography>
      <TableContainer component={Paper}>
        <Table padding="normal" tabIndex={0}>
          <TableBody>{renderHotkeys(hotkeys)}</TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );

  return (
    <Stack spacing={2}>
      {renderTable(t('my-meeting-menu-hotkeys-table-toggle-title'), groupedHotkeys.toggle)}
      {renderTable(t('my-meeting-menu-hotkeys-table-p2t-title'), groupedHotkeys.push2talk)}
    </Stack>
  );
};

export default HotkeyTable;
