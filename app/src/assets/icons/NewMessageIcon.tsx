// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import NewMessage from './source/new-message.svg?react';

const NewMessageIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={NewMessage} />;

export default NewMessageIcon;
