// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import EncryptedMessages from './source/encrypted-messages.svg?react';

const EncryptedMessagesIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={EncryptedMessages} />;

export default EncryptedMessagesIcon;
