// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Unlocked from './source/unlocked.svg?react';

const UnlockedIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Unlocked} />;

export default UnlockedIcon;
