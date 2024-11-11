// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import ArrowRight from './source/arrow-right.svg?react';

const ArrowRightIcon = (props: SvgIconProps) => <SvgIcon {...props} component={ArrowRight} inheritViewBox />;

export default ArrowRightIcon;
