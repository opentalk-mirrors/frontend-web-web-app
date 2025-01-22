// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Hidden from './source/hidden.svg?react';

const HiddenIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Hidden} />;

export default HiddenIcon;
