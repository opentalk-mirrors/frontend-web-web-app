// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';
import { IconButtonProps } from '@mui/material';
import React from 'react';

import IconButton from './IconButton';

interface StyledButtonProps {
  parentHasFocus?: boolean;
  parentDisabled?: boolean;
}
type AdornmentIconButtonProps = IconButtonProps & StyledButtonProps;
/**
 * IconButton Component to be used when used as adornment for InputFields
 */
const stylePropNames = ['parentHasFocus', 'parentDisabled'];
const StyledIconButton = styled(IconButton, {
  shouldForwardProp: (prop: string) => !stylePropNames.includes(prop),
})<StyledButtonProps>(({ theme, parentHasFocus = false, parentDisabled = false }) => {
  const focusColor = theme.palette.background.highlight.primary;
  const nonFocusColor = theme.palette.primary.dark;

  return {
    padding: theme.typography.pxToRem(12),
    opacity: parentDisabled ? 0.5 : 1,
    ':hover': { backgroundColor: parentHasFocus ? focusColor : nonFocusColor },
    ':focus': {
      backgroundColor: parentHasFocus ? focusColor : nonFocusColor,
      outline: parentHasFocus ? theme.palette.focus.contrastOutline : theme.palette.focus.outline,
    },
  };
});
const AdornmentIconButton = React.forwardRef<HTMLButtonElement, AdornmentIconButtonProps>(
  (props: AdornmentIconButtonProps, ref) => (
    <StyledIconButton ref={ref} {...props}>
      {props.children}
    </StyledIconButton>
  )
);
AdornmentIconButton.displayName = 'AdornmentIconButton';

export default AdornmentIconButton;
