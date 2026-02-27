// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, CircularProgress, styled } from '@mui/material';

const Container = styled(Box)(() => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
}));

const SuspenseLoading = ({
  size,
  color = 'secondary',
}: {
  size?: string;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}) => (
  <Container>
    <CircularProgress color={color} size={size} />
  </Container>
);

export default SuspenseLoading;
