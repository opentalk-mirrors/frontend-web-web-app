// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Locked from './source/locked.svg?react';

const LockedIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Locked} />;

export default LockedIcon;
