// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import NoOfParticipants from './source/no-of-participants.svg?react';

const NoOfParticipantsIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={NoOfParticipants} />;

export default NoOfParticipantsIcon;
