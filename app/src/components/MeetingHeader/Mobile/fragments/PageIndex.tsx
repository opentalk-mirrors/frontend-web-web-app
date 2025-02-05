// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Typography, styled } from '@mui/material';
import { MouseEvent } from 'react';

interface PageIndexProps {
  index: number;
  highlighted?: boolean;
  handleClick: (event: MouseEvent<HTMLElement>) => void;
}

const PageButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'highlighted',
})<{ highlighted?: boolean }>(({ theme, highlighted }) => ({
  borderRadius: '0.2rem',
  minWidth: '50%',
  background: highlighted ? theme.palette.background.light : 'transparent',
  borderColor: highlighted ? theme.palette.primary.main : theme.palette.background.light,
  '&:hover': {
    background: highlighted ? theme.palette.background.light : theme.palette.background.video,
  },
  '& .MuiTypography-root': {
    fontSize: theme.typography.pxToRem(14),
    color: highlighted ? theme.palette.primary.main : theme.palette.text.primary,
  },
  '&.MuiButtonBase-root': {
    padding: theme.spacing(0.3, 0.8),
  },
}));

const PageIndex = ({ index, highlighted, handleClick }: PageIndexProps) => {
  return (
    <PageButton highlighted={highlighted} onClick={handleClick} variant="outlined">
      <Typography component="span">{index}</Typography>
    </PageButton>
  );
};

export default PageIndex;
