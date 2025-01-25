// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box } from '@mui/material';
import React from 'react';

import { useIsMobile } from '../../../hooks/useMediaQuery';
import { MenuTab } from './constants';

interface TabPanelProps {
  children?: React.ReactNode;
  value: MenuTab;
  hidden: boolean;
}

const TabPanel = ({ children, value, hidden }: TabPanelProps) => {
  const isMobile = useIsMobile();

  return (
    <Box
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-hidden={hidden}
      aria-labelledby={`tab-${value}`}
      sx={{
        flex: 1,
        display: hidden ? 'none' : 'flex',
        overflow: 'hidden',
        mt: 2,
        minHeight: isMobile ? '60vh' : undefined,
      }}
    >
      {!hidden && children}
    </Box>
  );
};

export default TabPanel;
