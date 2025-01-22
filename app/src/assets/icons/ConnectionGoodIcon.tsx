// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import ConnectionGood from './source/connection-good.svg?react';

const ConnectionGoodIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={ConnectionGood} />;

export default ConnectionGoodIcon;
