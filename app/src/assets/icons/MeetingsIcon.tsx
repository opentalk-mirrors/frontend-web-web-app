// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Meetings from './source/meetings.svg?react';

const MeetingsIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Meetings} inheritViewBox />;

export default MeetingsIcon;
