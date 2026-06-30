// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import ChatOff from './source/chat-off.svg?react';

const ChatOffIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={ChatOff} />;

export default ChatOffIcon;
