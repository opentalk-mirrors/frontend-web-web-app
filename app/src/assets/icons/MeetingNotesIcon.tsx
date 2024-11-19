// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import MeetingNotes from './source/meeting-notes.svg?react';

const MeetingNotesIcon = (props: SvgIconProps) => <SvgIcon {...props} component={MeetingNotes} inheritViewBox />;

export default MeetingNotesIcon;
