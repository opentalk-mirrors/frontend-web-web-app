// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import NoOfParticipants from './source/no-of-participants.svg?react';

const NoOfParticipantsIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} component={NoOfParticipants} inheritViewBox />
);

export default NoOfParticipantsIcon;
