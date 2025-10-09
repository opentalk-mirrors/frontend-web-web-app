// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Theme, styled } from '@mui/material';

import { SecureIcon as DefaultSecureIcon, DoneIcon, SecureFilledIcon } from '../../../assets/icons';

const getIconColor = (theme: Theme, warning?: boolean) =>
  warning ? theme.palette.warning.main : theme.palette.secondary.main;

export const SecureIconSmall = styled(DefaultSecureIcon, { shouldForwardProp: (prop) => prop !== 'warning' })<{
  warning?: boolean;
}>(({ theme, warning }) => ({
  color: getIconColor(theme, warning),
  '&.MuiSvgIcon-root': {
    fontSize: theme.typography.pxToRem(24),
  },
}));

export const SecureFilledIconSmall = styled(SecureFilledIcon, { shouldForwardProp: (prop) => prop !== 'warning' })<{
  warning?: boolean;
}>(({ theme, warning }) => ({
  color: getIconColor(theme, warning),
  '&.MuiSvgIcon-root': {
    fontSize: theme.typography.pxToRem(24),
  },
}));

export const SecureIconBig = styled(DefaultSecureIcon, { shouldForwardProp: (prop) => prop !== 'warning' })<{
  warning?: boolean;
}>(({ theme, warning }) => ({
  color: getIconColor(theme, warning),
  width: '6rem',
  height: '6rem',
  padding: theme.spacing(1),
}));

export const SecureFilledIconBig = styled(SecureFilledIcon, { shouldForwardProp: (prop) => prop !== 'warning' })<{
  warning?: boolean;
}>(({ theme, warning }) => ({
  color: getIconColor(theme, warning),
  width: '6rem',
  height: '6rem',
  padding: theme.spacing(1),
}));

export const CheckmarkIconBig = styled(DoneIcon)<{ warning?: boolean }>(({ theme, warning }) => ({
  color: getIconColor(theme, warning),
  width: '3rem',
  height: '3rem',
  padding: theme.spacing(1),
}));
