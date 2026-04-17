// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { hotkeys } from '../../../store/slices/hotkeys/listener';

const HotkeyTable = () => {
  const { t } = useTranslation();

  const renderHotkeys = () =>
    hotkeys.map((hotkey) => {
      const key = hotkey.key === ' ' ? t('global-spacebar') : hotkey.key.toLowerCase();
      const translatedModifier = hotkey.modifier ? t(`modifier-${hotkey.modifier.toLowerCase()}`) : undefined;
      const keyCombination = translatedModifier ? `${translatedModifier} + ${key}` : key;

      return (
        <TableRow key={hotkey.key}>
          <TableCell headers="shortcut-key">
            <code>{keyCombination}</code>
          </TableCell>
          <TableCell headers="shortcut-description">
            <Typography fontWeight="300">{t(hotkey.descriptionKey)}</Typography>
          </TableCell>
        </TableRow>
      );
    });

  return (
    <>
      <Typography component="h3" gutterBottom>
        {t('my-meeting-menu-hotkeys-list')}
      </Typography>
      <TableContainer component={Paper}>
        <Table padding="normal" tabIndex={0}>
          <TableHead>
            <TableRow>
              <TableCell scope="col" id="shortcut-key">
                {t('global-hotkey')}
              </TableCell>
              <TableCell scope="col" id="shortcut-description">
                {t('global-description')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{renderHotkeys()}</TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default HotkeyTable;
