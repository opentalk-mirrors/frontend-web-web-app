// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, styled } from '@mui/material';

import Toolbar from '../Toolbar';
import SidePanelToolbar from './fragments/SidePanelToolbar';

const FooterContainer = styled(Box)(({ theme }) => ({
  gridArea: 'footer',
  display: 'grid',
  alignItems: 'center',
  gap: theme.spacing(2),
  background: theme.palette.background.customPaper.primary,
  borderRadius: theme.borderRadius.medium,
  padding: theme.spacing(1),
  gridTemplateColumns: '1fr auto 1fr',
  '&::before': {
    content: '""',
  },
}));

const MeetingFooter = () => {
  return (
    <FooterContainer>
      <Toolbar />
      <SidePanelToolbar />
    </FooterContainer>
  );
};

export default MeetingFooter;
