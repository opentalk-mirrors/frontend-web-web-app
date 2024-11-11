// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, SvgIcon, SvgIconProps } from '@mui/material';

import MicOff from './source/mic-off.svg?react';

interface MicOffIconExtraProps extends SvgIconProps {
  disabled?: boolean;
}

const StyledSvgIcon = styled(SvgIcon)<MicOffIconExtraProps>(({ theme, disabled }) => ({
  fill: disabled ? theme.palette.text.disabled : theme.palette.text.primary,
  '& .mic-off-line': {
    fill: disabled ? theme.palette.text.disabled : theme.palette.warning.main,
  },
}));

const MicOffIcon = (props: MicOffIconExtraProps) => <StyledSvgIcon {...props} component={MicOff} inheritViewBox />;

export default MicOffIcon;
