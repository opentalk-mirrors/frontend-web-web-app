// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import ArrowDown from './source/arrow-down.svg?react';

const ArrowDownIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={ArrowDown} />;

export default ArrowDownIcon;
