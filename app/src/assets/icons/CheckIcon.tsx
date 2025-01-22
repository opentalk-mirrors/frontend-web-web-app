// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Check from './source/check.svg?react';

const CheckIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Check} />;

export default CheckIcon;
