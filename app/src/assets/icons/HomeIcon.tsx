// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Home from './source/home.svg?react';

const HomeIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Home} />;

export default HomeIcon;
