// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import CameraOff from './source/camera-off.svg?react';

const CameraOffIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={CameraOff} />;

export default CameraOffIcon;
