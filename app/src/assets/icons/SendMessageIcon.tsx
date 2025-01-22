// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import SendMessage from './source/send-message.svg?react';

const SendMessageIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={SendMessage} />;

export default SendMessageIcon;
