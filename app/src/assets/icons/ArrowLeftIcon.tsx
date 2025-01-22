// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import ArrowLeft from './source/arrow-left.svg?react';

const ArrowLeftIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={ArrowLeft} />;

export default ArrowLeftIcon;
