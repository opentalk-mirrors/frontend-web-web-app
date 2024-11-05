// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import CoffeeBreak from './source/coffee-break.svg?react';

const CoffeeBreakIcon = (props: SvgIconProps) => <SvgIcon {...props} component={CoffeeBreak} inheritViewBox />;

export default CoffeeBreakIcon;
