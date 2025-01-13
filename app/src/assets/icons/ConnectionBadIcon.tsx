// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import ConnectionBad from './source/connection-bad.svg?react';

const ConnectionBadIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={ConnectionBad} />;

export default ConnectionBadIcon;
