// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Keyboard from './source/keyboard.svg?react';

const KeyboardIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Keyboard} />;

export default KeyboardIcon;
