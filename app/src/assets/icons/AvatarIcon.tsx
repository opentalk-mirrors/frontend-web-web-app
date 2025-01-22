// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Avatar from './source/avatar.svg?react';

const AvatarIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Avatar} />;

export default AvatarIcon;
