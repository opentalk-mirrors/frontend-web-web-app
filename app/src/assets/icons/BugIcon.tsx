// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Bug from './source/bug.svg?react';

const BugIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Bug} />;

export default BugIcon;
