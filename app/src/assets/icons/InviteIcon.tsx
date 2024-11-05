// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Invite from './source/invite.svg?react';

const InviteIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Invite} inheritViewBox />;

export default InviteIcon;
