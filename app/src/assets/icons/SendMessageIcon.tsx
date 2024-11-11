// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import SendMessage from './source/send-message.svg?react';

const SendMessageIcon = (props: SvgIconProps) => <SvgIcon {...props} component={SendMessage} inheritViewBox />;

export default SendMessageIcon;
