// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Remove from './source/remove.svg?react';

const RemoveIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Remove} />;

export default RemoveIcon;
