// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Error from './source/error.svg?react';

const ErrorIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Error} inheritViewBox />;

export default ErrorIcon;
