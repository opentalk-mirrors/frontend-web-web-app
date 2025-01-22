// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Breakrooms from './source/breakrooms.svg?react';

const BreakroomsIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Breakrooms} />;

export default BreakroomsIcon;
