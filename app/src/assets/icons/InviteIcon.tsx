// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Invite from './source/invite.svg?react';

const InviteIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Invite} />;

export default InviteIcon;
