// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import TalkingStick from './source/talking-stick.svg?react';

const TalkingStickIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={TalkingStick} />;

export default TalkingStickIcon;
