// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, Box } from '@mui/material';

import Toolbar from '../Toolbar';

const FooterContainer = styled(Box)(({ theme }) => ({
  gridArea: 'footer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  background: theme.palette.background.customPaper.primary,
  borderRadius: theme.borderRadius.medium,
  padding: theme.spacing(1),
}));

const MeetingFooter = () => {
  return (
    <FooterContainer>
      <Toolbar />
    </FooterContainer>
  );
};

export default MeetingFooter;
