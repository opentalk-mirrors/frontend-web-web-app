// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import MeetingRoom from './source/meeting-room.svg?react';

const MeetingRoomIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={MeetingRoom} />;

export default MeetingRoomIcon;
