// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Duration from './source/duration.svg?react';

const DurationIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Duration} />;

export default DurationIcon;
