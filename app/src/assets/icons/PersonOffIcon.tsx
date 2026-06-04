// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import PersonOff from './source/person-off.svg?react';

const PersonOffIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={PersonOff} />;

export default PersonOffIcon;
