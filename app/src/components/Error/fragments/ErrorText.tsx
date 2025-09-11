// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack, Typography, styled } from '@mui/material';

const Container = styled(Stack)({
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
});

const ErrorTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

interface ErrorTextProps {
  title: string;
  description?: string;
}

const ErrorText = ({ title, description }: ErrorTextProps) => {
  return (
    <Container spacing={2}>
      <ErrorTypography variant="h5">{title}</ErrorTypography>
      {description && <ErrorTypography variant="body2">{description}</ErrorTypography>}
    </Container>
  );
};

export default ErrorText;
