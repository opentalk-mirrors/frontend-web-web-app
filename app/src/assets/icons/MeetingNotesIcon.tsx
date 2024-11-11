// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Protocol from './source/protocol.svg?react';

const MeetingNotesIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Protocol} inheritViewBox />;

export default MeetingNotesIcon;
