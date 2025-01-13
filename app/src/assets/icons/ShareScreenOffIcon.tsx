// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import ShareScreenOff from './source/share-screen-off.svg?react';

const ShareScreenOffIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={ShareScreenOff} />;

export default ShareScreenOffIcon;
