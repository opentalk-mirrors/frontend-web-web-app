// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Warning from './source/warning.svg?react';

const WarningIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Warning} inheritViewBox />;

export default WarningIcon;
