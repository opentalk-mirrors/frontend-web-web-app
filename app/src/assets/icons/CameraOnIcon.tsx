// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import CameraOn from './source/camera-on.svg?react';

const CameraOnIcon = (props: SvgIconProps) => <SvgIcon {...props} component={CameraOn} inheritViewBox />;

export default CameraOnIcon;
