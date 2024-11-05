// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import ShareScreenOff from './source/share-screen-off.svg?react';

const ShareScreenOffIcon = (props: SvgIconProps) => <SvgIcon {...props} component={ShareScreenOff} inheritViewBox />;

export default ShareScreenOffIcon;
