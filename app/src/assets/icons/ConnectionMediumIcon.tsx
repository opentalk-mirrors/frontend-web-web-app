// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import ConnectionMedium from './source/connection-medium.svg?react';

const ConnectionMediumIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={ConnectionMedium} />;

export default ConnectionMediumIcon;
