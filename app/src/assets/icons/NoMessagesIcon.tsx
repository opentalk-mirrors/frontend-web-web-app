// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import NoMessages from './source/no-messages.svg?react';

const NoMessagesIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={NoMessages} />;

export default NoMessagesIcon;
