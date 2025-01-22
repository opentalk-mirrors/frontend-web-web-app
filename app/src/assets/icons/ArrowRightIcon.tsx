// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import ArrowRight from './source/arrow-right.svg?react';

const ArrowRightIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={ArrowRight} />;

export default ArrowRightIcon;
