// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import MicOn from './source/mic-on.svg?react';

const MicOnIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={MicOn} />;

export default MicOnIcon;
