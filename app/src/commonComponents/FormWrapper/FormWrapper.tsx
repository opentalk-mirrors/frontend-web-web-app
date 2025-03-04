// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { FormControl, Stack, styled } from '@mui/material';
import type { CSSObject } from '@mui/material';
import { useMemo } from 'react';

import ErrorFormMessage from '../ErrorFormMessage';

export type FormProps = {
  label?: string;
  helperText?: string;
  valid?: boolean;
  fullWidth?: boolean;
  error?: boolean;
  stacked?: boolean;
  /**
   * Width control property, when placed as `true` keeps content at `max-content` width.
   */
  inline?: boolean;
  htmlFor?: string;
};

type FormWrapperProps = {
  children: React.ReactElement | Array<React.ReactElement | null> | null;
} & FormProps;

const Label = styled('label')(({ theme }) => ({
  display: 'inline-block',
  marginBottom: theme.spacing(1.5),
}));

export const FormWrapper = ({
  error = false,
  label,
  helperText,
  fullWidth = false,
  children,
  stacked,
  inline,
  htmlFor,
}: FormWrapperProps) => {
  const content = (
    <>
      {label && (htmlFor ? <Label htmlFor={htmlFor}>{label}</Label> : <Label as="span">{label}</Label>)}
      {children}
      {error && <ErrorFormMessage helperText={helperText} />}
    </>
  );

  const sx = useMemo(() => {
    const output: CSSObject = {};
    if (inline) {
      output.width = 'max-content';
    }
    return output;
  }, [inline]);

  return (
    <FormControl variant="standard" fullWidth={fullWidth} sx={sx} error={error}>
      {stacked ? <Stack spacing={2}>{content}</Stack> : content}
    </FormControl>
  );
};
