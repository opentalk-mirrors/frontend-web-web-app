// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Settings from './source/dashboard-legal.svg?react';

const LegalLinksIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Settings} inheritViewBox />;

export default LegalLinksIcon;
