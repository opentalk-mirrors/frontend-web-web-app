// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import ReactionOn from './source/reaction-on.svg?react';

const ReactionOnIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={ReactionOn} />;

export default ReactionOnIcon;
