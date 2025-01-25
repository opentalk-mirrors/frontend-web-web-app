// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box } from '@mui/material';

import CollapseButton from './CollapseButton';
import VersionBadge from './VersionBadge';

interface CollapseRowProps {
  collapsed: boolean;
  onChange: (nextCollapsed: boolean) => void;
}

const CollapseRow = (props: CollapseRowProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingX: 3,
        marginTop: 1,
      }}
    >
      <VersionBadge collapsed={props.collapsed} />
      <CollapseButton collapsed={props.collapsed} onClick={props.onChange} />
    </Box>
  );
};

export default CollapseRow;
