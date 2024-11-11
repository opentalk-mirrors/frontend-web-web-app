// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import TalkingStick from './source/talking-stick.svg?react';

const TalkingStickIcon = (props: SvgIconProps) => <SvgIcon {...props} component={TalkingStick} inheritViewBox />;

export default TalkingStickIcon;
