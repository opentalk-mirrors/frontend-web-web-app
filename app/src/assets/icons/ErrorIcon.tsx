// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Error from './source/error.svg?react';

const ErrorIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Error} />;

export default ErrorIcon;
