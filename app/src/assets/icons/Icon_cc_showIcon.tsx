// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Icon_cc_show from './source/icon_cc_show.svg?react';

const Icon_cc_showIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Icon_cc_show} />;

export default Icon_cc_showIcon;
