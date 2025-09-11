// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, Tooltip, IconButtonProps, IconButton } from '@mui/material';
import { MouseEvent, ReactNode } from 'react';

import { ArrowDownIcon } from '../../../assets/icons';

interface IButtonProps {
  isActive?: boolean;
  isLobby?: boolean;
}

const ButtonContainer = styled('div')(() => ({
  cursor: 'pointer',
  position: 'relative',
}));

const ToolbarIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'isActive' && prop !== 'isLobby',
})<IButtonProps>(({ theme, isActive, isLobby }) => ({
  cursor: 'pointer',
  position: 'relative',
  boxShadow: 'none',
  minWidth: 0,
  width: '2.5rem',
  height: '2.08rem',
  backgroundColor: theme.palette.background.main.primary,
  color: theme.palette.background.main.contrastText,
  borderRadius: theme.borderRadius.large,
  '&:hover': {
    background: theme.palette.primary.main,
    '& > svg': {
      fill: theme.palette.primary.contrastText,
    },
  },
  '& svg': {
    fill: theme.palette.background.main.contrastText,
  },
  '& .off-line': {
    fill: theme.palette.danger.light,
  },
  '&.Mui-focusVisible': {
    outline: theme.palette.focus.outline,
  },
  '& .MuiSvgIcon-root': {
    fontSize: theme.typography.pxToRem(18),
    [theme.breakpoints.down('md')]: {
      fontSize: theme.typography.pxToRem(16),
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.4rem',
    },
  },
  ':disabled': {
    backgroundColor: theme.palette.background.main.primary,
    '& svg': {
      fill: theme.palette.background.main.contrastText,
    },
    '& .off-line': {
      fill: theme.palette.background.main.contrastText,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0.5, 0.5, 0.5, 0.2)',
      borderRadius: theme.borderRadius.large,
    },
  },
  [theme.breakpoints.down('sm')]: {
    width: '3.25rem',
    height: '2.704rem',
  },
  ...(isActive && {
    background: theme.palette.primary.main,
    '& svg': {
      fill: theme.palette.primary.contrastText,
    },
  }),
  ...(isLobby && {
    width: '3.25rem',
    height: '2.75rem',
    border: `1px solid ${theme.palette.common.white}`,

    ...(isActive && {
      border: `1px solid ${theme.palette.primary.main}`,
    }),
  }),
}));

const ToggleButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'isActive' && prop !== 'isLobby',
})<IButtonProps>(({ theme, isActive, isLobby }) => ({
  backgroundColor: isActive ? theme.palette.primary.main : theme.palette.background.main.primary,
  color: theme.palette.background.main.contrastText,
  padding: theme.spacing(0.4),
  border: `solid 0.125em ${theme.palette.background.customPaper.primary}`,
  position: 'absolute',
  bottom: '-0.25em',
  right: '-0.25em',
  '&.Mui-focusVisible': {
    outline: theme.palette.focus.outline,
  },
  '& .MuiSvgIcon-root': {
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.3rem',
    },
  },
  '& svg': {
    fill: isActive ? theme.palette.primary.contrastText : theme.palette.text.primary,
    width: '0.5em',
    height: '0.5em',
  },
  '&:hover': {
    background: theme.palette.primary.main,
    '& svg': {
      fill: theme.palette.primary.contrastText,
    },
  },
  [theme.breakpoints.down('sm')]: {
    right: '-0.65em',
    width: '1.3em',
    height: '1.3em',
  },
  ...(isLobby && {
    padding: theme.spacing(0.625),
    border: `1px solid ${theme.palette.common.white}`,
  }),
  [theme.breakpoints.down('md')]: {
    padding: isLobby ? theme.spacing(0.625) : theme.spacing(0.4),
  },
}));

export type ToolbarButtonProps = {
  hasContext?: boolean;
  tooltipTitle: string;
  contextDisabled?: boolean;
  contextTitle?: string;
  contextMenuId?: string;
  contextMenuExpanded?: boolean;
  disabled?: boolean;
  active: boolean;
  onClick: (event?: MouseEvent) => void;
  openMenu?: () => void;
  children: ReactNode;
  isLobby?: boolean;
} & IconButtonProps;

const ToolbarButton = ({
  children,
  onClick,
  hasContext,
  contextDisabled,
  contextTitle,
  contextMenuId,
  contextMenuExpanded,
  disabled,
  active,
  openMenu,
  tooltipTitle,
  isLobby,
  ...props
}: ToolbarButtonProps) => (
  <>
    <Tooltip placement="top" title={tooltipTitle}>
      <ButtonContainer>
        <ToolbarIconButton
          isActive={active}
          disabled={disabled || undefined}
          aria-label={tooltipTitle}
          onClick={(event) => onClick(event)}
          isLobby={isLobby}
          {...props}
        >
          {children}
        </ToolbarIconButton>
        {hasContext && !contextDisabled && (
          <ToggleButton
            isActive={active}
            onClick={(event) => {
              event.stopPropagation();
              if (openMenu) {
                openMenu();
              }
            }}
            isLobby={isLobby}
            aria-label={contextTitle}
            aria-controls={contextMenuId}
            aria-expanded={contextMenuExpanded}
          >
            <ArrowDownIcon />
          </ToggleButton>
        )}
      </ButtonContainer>
    </Tooltip>
  </>
);

export default ToolbarButton;
