// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import MicOff from './source/mic-off.svg?react';

const MicOffIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={MicOff} />;

export default MicOffIcon;
