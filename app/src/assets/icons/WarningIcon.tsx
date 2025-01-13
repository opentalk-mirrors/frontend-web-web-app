// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Warning from './source/warning.svg?react';

const WarningIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Warning} />;

export default WarningIcon;
