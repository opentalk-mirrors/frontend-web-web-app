// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Container as MuiContainer, styled } from '@mui/material';
import { Outlet } from 'react-router-dom';

const Container = styled(MuiContainer)(({ theme }) => ({
  maxWidth: 944,
  margin: 0,
  overflow: 'auto',
  color: theme.palette.background.highlight.contrastText,
}));

const DashboardSettingsTemplate = () => {
  return (
    <Container maxWidth={false} disableGutters>
      <Outlet />
    </Container>
  );
};

export default DashboardSettingsTemplate;
