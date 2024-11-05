// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Copy from './source/copy.svg?react';

const CopyIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Copy} inheritViewBox />;

export default CopyIcon;
