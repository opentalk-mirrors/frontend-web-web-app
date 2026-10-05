// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Messages from './source/messages.svg?react';

const MessagesIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Messages} />;

export default MessagesIcon;
