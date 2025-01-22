// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Info from './source/info.svg?react';

const InfoIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Info} />;

export default InfoIcon;
