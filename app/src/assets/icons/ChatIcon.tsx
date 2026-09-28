// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Chat from './source/chat.svg?react';

const ChatIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Chat} />;

export default ChatIcon;
