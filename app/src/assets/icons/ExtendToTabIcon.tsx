// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import ExtendToTab from './source/extend-to-tab.svg?react';

const ExtendToTabIcon = (props: SvgIconProps) => <SvgIcon {...props} component={ExtendToTab} inheritViewBox />;

export default ExtendToTabIcon;
