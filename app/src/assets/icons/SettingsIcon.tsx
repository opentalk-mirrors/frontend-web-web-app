// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Settings from './source/settings.svg?react';

const SettingsIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Settings} />;

export default SettingsIcon;
