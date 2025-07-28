// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Link, styled } from '@mui/material';

export type JumpLinkProps = {
  to: string;
  text: string;
};
const JumpLinkDisplay = styled(Link)(({ theme }) => ({
  position: 'fixed',
  top: '-50px',
  left: '45%',
  zIndex: theme.zIndex.jumpLink,
  textDecoration: 'none',
  color: theme.palette.primary.contrastText,
  transition: 'top 195ms cubic-bezier(0.4, 0, 1, 1) 0ms',
  backgroundColor: theme.palette.primary.light,
  borderRadius: '12px',
  padding: `${theme.typography.pxToRem(8)}`,
  outline: `3px solid ${theme.palette.secondary.main}`,
  boxShadow: `5px 5px ${theme.palette.background.customPaper.primary}`,
  ':focus': {
    top: '20px',
  },
}));
export const JumpLink = ({ to, text }: JumpLinkProps) => {
  return <JumpLinkDisplay href={to}>{text}</JumpLinkDisplay>;
};
