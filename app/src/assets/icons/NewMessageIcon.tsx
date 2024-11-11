// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import NewMessage from './source/new-message.svg?react';

const NewMessageIcon = (props: SvgIconProps) => <SvgIcon {...props} component={NewMessage} inheritViewBox />;

export default NewMessageIcon;
