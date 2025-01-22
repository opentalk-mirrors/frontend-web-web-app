// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Back from './source/back.svg?react';

const BackIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Back} />;

export default BackIcon;
