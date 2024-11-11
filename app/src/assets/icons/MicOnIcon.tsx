// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import MicOn from './source/mic-on.svg?react';

const MicOnIcon = (props: SvgIconProps) => <SvgIcon {...props} component={MicOn} inheritViewBox />;

export default MicOnIcon;
