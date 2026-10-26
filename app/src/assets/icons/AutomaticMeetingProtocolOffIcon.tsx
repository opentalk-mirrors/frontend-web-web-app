// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import AutomaticMeetingProtocolOff from './source/automatic_meeting_protocol_off.svg?react';

const AutomaticMeetingProtocolOffIcon = (props: SvgIconProps) => (
  <AccessibleSvgIcon {...props} component={AutomaticMeetingProtocolOff} />
);

export default AutomaticMeetingProtocolOffIcon;
