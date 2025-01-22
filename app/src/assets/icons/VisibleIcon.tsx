// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Visible from './source/visible.svg?react';

const VisibleIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Visible} />;

export default VisibleIcon;
