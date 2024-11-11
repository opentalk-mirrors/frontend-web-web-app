// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Done from './source/done.svg?react';

const DoneIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Done} inheritViewBox />;

export default DoneIcon;
