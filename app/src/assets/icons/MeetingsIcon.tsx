// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Meetings from './source/meetings.svg?react';

const MeetingsIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Meetings} />;

export default MeetingsIcon;
