// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { TableCell, TableRow, Typography } from '@mui/material';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

function VoteEmptyRow() {
  const { t } = useTranslation();

  return (
    <TableRow>
      <TableCell colSpan={4}>
        <Typography
          noWrap
          component="span"
          sx={{
            textAlign: 'center',
            display: 'block',
          }}
        >
          {t('legal-vote-no-results')}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

export default memo(VoteEmptyRow);
