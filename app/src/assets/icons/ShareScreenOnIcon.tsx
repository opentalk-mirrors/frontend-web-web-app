// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import ShareScreenOn from './source/share-screen-on.svg?react';

const ShareScreenOnIcon = (props: SvgIconProps) => <SvgIcon {...props} component={ShareScreenOn} inheritViewBox />;

export default ShareScreenOnIcon;
