// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import CameraOn from './source/camera-on.svg?react';

const CameraOnIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={CameraOn} />;

export default CameraOnIcon;
