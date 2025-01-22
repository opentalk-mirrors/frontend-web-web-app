// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import ShareScreenOn from './source/share-screen-on.svg?react';

const ShareScreenOnIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={ShareScreenOn} />;

export default ShareScreenOnIcon;
