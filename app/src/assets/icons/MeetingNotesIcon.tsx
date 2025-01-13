// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import MeetingNotes from './source/meeting-notes.svg?react';

const MeetingNotesIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={MeetingNotes} />;

export default MeetingNotesIcon;
