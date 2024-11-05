// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Bug from './source/bug.svg?react';

const BugIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Bug} inheritViewBox />;

export default BugIcon;
