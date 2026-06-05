// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import ReactionOff from './source/reaction-off.svg?react';

const ReactionOffIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={ReactionOff} />;

export default ReactionOffIcon;
