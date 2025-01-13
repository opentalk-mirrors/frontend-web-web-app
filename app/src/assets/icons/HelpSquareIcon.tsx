// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import HelpSquare from './source/help-square.svg?react';

const HelpSquareIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={HelpSquare} />;

export default HelpSquareIcon;
