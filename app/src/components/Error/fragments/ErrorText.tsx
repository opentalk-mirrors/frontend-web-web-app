// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack, Typography, styled } from '@mui/material';

const Container = styled(Stack)({
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
});
interface ErrorTextProps {
  title: string;
  description?: string;
}

const ErrorText = ({ title, description }: ErrorTextProps) => {
  return (
    <Container spacing={2}>
      <Typography variant="h5">{title}</Typography>
      {description && <Typography variant="body2">{description}</Typography>}
    </Container>
  );
};

export default ErrorText;
