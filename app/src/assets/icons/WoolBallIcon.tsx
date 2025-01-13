// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import WoolBall from './source/wool-ball.svg?react';

const WoolBallIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={WoolBall} />;

export default WoolBallIcon;
