// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { TableCell, TableRow, Typography } from '@mui/material';
import { memo } from 'react';

interface VoteResultRowProps {
  total: number;
}

function VoteResultCountRow(props: VoteResultRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={3}>
        <Typography noWrap component="span" sx={{ maxWidth: '170px', display: 'block' }}>
          Total
        </Typography>
      </TableCell>
      <TableCell align="right">{props.total}</TableCell>
    </TableRow>
  );
}

export default memo(VoteResultCountRow);
