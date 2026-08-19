// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack, Typography } from '@mui/material';

interface CustomHelperTextProps {
  helperText: string;
  characterCount?: number;
  maxCharacters?: number;
}

const CustomHelperText = ({ helperText, characterCount, maxCharacters }: CustomHelperTextProps) => {
  return (
    <Stack component="span" direction="row" justifyContent="space-between">
      <Typography component="span" variant="caption" color="text.primary">
        {helperText}
      </Typography>
      {characterCount !== undefined && maxCharacters !== undefined && (
        <Typography component="span" variant="caption">
          {`${characterCount}/${maxCharacters}`}
        </Typography>
      )}
    </Stack>
  );
};

export default CustomHelperText;
