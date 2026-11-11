// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import AutomaticMeetingProtocolOn from './source/automatic_meeting_protocol_on.svg?react';

const AutomaticMeetingProtocolOnIcon = (props: SvgIconProps) => (
  <AccessibleSvgIcon {...props} component={AutomaticMeetingProtocolOn} />
);

export default AutomaticMeetingProtocolOnIcon;
