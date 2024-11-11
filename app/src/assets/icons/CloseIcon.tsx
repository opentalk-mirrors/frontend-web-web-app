// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Close from './source/close.svg?react';

const CloseIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Close} inheritViewBox />;

export default CloseIcon;
