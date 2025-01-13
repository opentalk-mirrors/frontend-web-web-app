// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import MuteAll from './source/mute-all.svg?react';

const MuteAllIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={MuteAll} />;

export default MuteAllIcon;
