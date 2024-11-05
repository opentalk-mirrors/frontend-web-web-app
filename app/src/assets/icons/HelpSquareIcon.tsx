// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Help from './source/help-square.svg?react';

const HelpSquareIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Help} inheritViewBox />;

export default HelpSquareIcon;
