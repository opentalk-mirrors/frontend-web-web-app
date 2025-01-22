// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Help from './source/help.svg?react';

const HelpIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Help} />;

export default HelpIcon;
