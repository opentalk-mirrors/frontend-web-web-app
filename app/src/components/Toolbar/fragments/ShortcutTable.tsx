// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { HOTKEY_FULLSCREEN, HOTKEY_MICROPHONE, HOTKEY_NEXT_SPEAKER, HOTKEY_VIDEO } from '../../../constants';

export const ShortcutTable = () => {
  const { t } = useTranslation();

  const shortcuts = useMemo(() => {
    return [
      {
        key: HOTKEY_MICROPHONE,
        description: `${t('global-microphone')} ${t('global-on')} / ${t('global-off')}`,
      },
      {
        key: HOTKEY_VIDEO,
        description: `${t('global-video')} ${t('global-on')} / ${t('global-off')}`,
      },
      {
        key: HOTKEY_FULLSCREEN,
        description: `${t('global-fullscreen')} ${t('global-on')} / ${t('global-off')}`,
      },
      {
        key: HOTKEY_NEXT_SPEAKER,
        description: t('shortcut-pass-talking-stick'),
      },
      {
        key: t('global-spacebar'),
        description: t('shortcut-hold-to-speak'),
      },
    ] as const;
  }, [t]);

  return (
    <TableContainer component={Paper}>
      <Table padding="normal" tabIndex={0}>
        <TableHead>
          <TableRow>
            <TableCell scope="col" id="shortcut-key">
              {t('global-shortcut')}
            </TableCell>
            <TableCell scope="col" id="shortcut-description">
              {t('global-description')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {shortcuts.map((shortcut) => (
            <TableRow key={shortcut.key}>
              <TableCell headers="shortcut-key">
                <code>{shortcut.key}</code>
              </TableCell>
              <TableCell headers="shortcut-description">
                <Typography
                  sx={{
                    fontWeight: 300,
                  }}
                >
                  {shortcut.description}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
