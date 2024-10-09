// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import { ReactComponent as CameraOn } from './source/check.svg';

const CheckIcon = (props: SvgIconProps) => <SvgIcon {...props} component={CameraOn} inheritViewBox />;

export default CheckIcon;
