// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Avatar from './source/avatar.svg?react';

const AvatarIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Avatar} inheritViewBox />;

export default AvatarIcon;
