// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Typography, styled } from '@mui/material';
import React, { forwardRef } from 'react';

import { ModerationTabKey } from '../../../config/moderationTabs';

interface SideTabPanelProps {
  value: ModerationTabKey;
  children?: React.ReactNode;
  hidden?: boolean;
  tabTitle?: string;
}

const TabTitle = styled(Typography)(({ theme }) => ({
  paddingBottom: theme.spacing(2),
  fontSize: '1.25rem',
  margin: 0,
}));

const TabContainer = styled('div')(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  //Applies padding to immediate child container to avoid cutting off outline
  '& > .MuiStack-root': {
    padding: theme.spacing(0.5),
  },
}));

const SideTabPanel = forwardRef<unknown, SideTabPanelProps>(({ children, value, hidden, tabTitle }, ref) => {
  return (
    <Box
      {...ref}
      role="tabpanel"
      aria-hidden={hidden}
      id={`tabpanel-${value}`}
      aria-labelledby={value}
      sx={[
        {
          flex: 1,
          display: hidden ? 'none' : 'flex',
          flexDirection: 'column',
          maxWidth: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
        },
      ]}
    >
      {tabTitle && <TabTitle variant="h3">{tabTitle}</TabTitle>}
      {!hidden && <TabContainer>{children}</TabContainer>}
    </Box>
  );
});

export default SideTabPanel;
