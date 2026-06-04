// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Person from './source/person.svg?react';

const PersonIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Person} />;

export default PersonIcon;
