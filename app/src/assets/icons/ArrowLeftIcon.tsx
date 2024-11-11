// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import ArrowLeft from './source/arrow-left.svg?react';

const ArrowLeftIcon = (props: SvgIconProps) => <SvgIcon {...props} component={ArrowLeft} inheritViewBox />;

export default ArrowLeftIcon;
