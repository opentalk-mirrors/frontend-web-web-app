// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import NoMeetingRoom from './source/no-meeting-room.svg?react';

const NoMeetingRoomIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={NoMeetingRoom} />;

export default NoMeetingRoomIcon;
