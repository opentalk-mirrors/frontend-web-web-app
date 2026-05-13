// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Icon_cc_hide from './source/icon_cc_hide.svg?react';

const Icon_cc_hideIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Icon_cc_hide} />;

export default Icon_cc_hideIcon;
