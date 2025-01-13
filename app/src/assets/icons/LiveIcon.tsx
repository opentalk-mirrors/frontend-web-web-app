// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Live from './source/live.svg?react';

const LiveIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Live} />;

export default LiveIcon;
