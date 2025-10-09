// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { GlobalStyles, Theme, styled } from '@mui/material';
import {
  SnackbarKey,
  SnackbarProvider as SnackbarProviderDefault,
  SnackbarProviderProps as SnackbarProviderPropsDefault,
} from 'notistack';
import React from 'react';

import { useAppSelector } from '../../../../hooks/useCustomRedux';
import { selectFullscreenActive, selectFullscreenElement } from '../../../../store/slices/fullscreen/slice';
import { CloseButton } from '../CloseButton';
import { notifications } from '../utils';
import { getNotistackComponents } from '../variations';

const StyledCloseButton = styled(CloseButton)(({ theme }) => ({
  padding: theme.spacing(1),
}));

export interface SnackbarProviderProps extends SnackbarProviderPropsDefault {
  children: React.ReactNode;
}

const getSnackbarContainerRootClass = (theme: Theme) => ({
  top: '60px !important',
  '& > div': {
    width: '100%',
    minWidth: '280px',
    [theme.breakpoints.up('sm')]: {
      width: '30vw',
    },
  },
});

const getSnackbarRootClass = () => ({
  width: '100%',
  '& > .notistack-MuiContent': {
    flexWrap: 'nowrap',
    '& >  #notistack-snackbar': {
      alignItems: 'flex-start',
    },
  },
});

const SnackbarProvider = (props: SnackbarProviderProps) => {
  const fullscreenElement = useAppSelector(selectFullscreenElement);
  const isFullscreenActive = useAppSelector(selectFullscreenActive);
  const onClickDismiss = (key: SnackbarKey) => {
    notifications.close(key);
  };
  const { children, Components, domRoot } = props;

  return (
    <>
      {/*
          The only found possibility till now to customize snackbar container of Notistack is to use the `classes` API.
          Therefor we need to generate custom CSS classes and apply them to the `SnackbarProvider`.
          Using GlobalStyles seems to be a better alternative, than creating an external *.css file.
          But maybe there is a better way to do it?
      */}
      <GlobalStyles
        styles={(theme: Theme) => ({
          '.SnackbarContainerRoot': getSnackbarContainerRootClass(theme),
          '.SnackbarRoot': getSnackbarRootClass(),
        })}
      />
      <SnackbarProviderDefault
        classes={{
          containerRoot: 'SnackbarContainerRoot',
          root: 'SnackbarRoot',
        }}
        dense
        maxSnack={3}
        preventDuplicate
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        action={(snackbarKey: SnackbarKey) => <StyledCloseButton onClick={() => onClickDismiss(snackbarKey)} />}
        Components={{ ...getNotistackComponents(Components) }}
        domRoot={isFullscreenActive && fullscreenElement ? fullscreenElement : domRoot}
      >
        {children}
      </SnackbarProviderDefault>
    </>
  );
};

export default SnackbarProvider;
