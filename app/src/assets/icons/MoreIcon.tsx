// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import More from './source/more.svg?react';

const MoreIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={More} />;

export default MoreIcon;
