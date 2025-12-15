// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItem as MuiListItem, styled } from '@mui/material';

const ListItem = styled(MuiListItem, {
  shouldForwardProp: (prop) => prop !== 'isSubmenuOpen',
})<{ isSubmenuOpen?: boolean }>(({ theme, isSubmenuOpen }) => ({
  padding: 0,
  paddingRight: theme.spacing(3),
  borderRadius: `${theme.borderRadius.large}px 0 0 ${theme.borderRadius.large}px`,
  background: isSubmenuOpen ? theme.palette.background.highlight.primary : theme.palette.background.customPaper.primary,

  [theme.breakpoints.down('md')]: {
    borderRadius: 0,
    paddingRight: 0,
    marginLeft: 0,
  },

  '> *, & .MuiButton-root': {
    color: isSubmenuOpen
      ? theme.palette.background.highlight.contrastText
      : theme.palette.background.customPaper.contrastText,
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5, 3),
    borderRadius: theme.borderRadius.large,
    textDecoration: 'none',
    width: '100%',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    justifyContent: 'flex-start',

    '& svg': {
      fill: 'currentcolor',
    },

    '& .MuiListItemText-root': {
      paddingLeft: theme.spacing(2),
      fontSize: '1rem',
      '& .MuiListItemText-primary': {
        fontWeight: 'bold',
      },
    },

    '&:focus-visible': {
      outline: theme.palette.focus.outline,
      outlineOffset: theme.palette.focus.outlineOffset,
    },

    '&:hover': {
      background: theme.palette.background.highlight.primary,
      color: theme.palette.background.highlight.contrastText,
    },

    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(1.5, 3),
      borderRadius: 0,

      '*': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    },
  },
  '& .active-link': {
    background: theme.palette.background.highlight.primary,
    color: theme.palette.background.highlight.contrastText,
  },
}));

export default ListItem;
