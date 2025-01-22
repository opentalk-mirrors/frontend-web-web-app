// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import ArrowUp from './source/arrow-up.svg?react';

const ArrowUpIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={ArrowUp} />;

export default ArrowUpIcon;
