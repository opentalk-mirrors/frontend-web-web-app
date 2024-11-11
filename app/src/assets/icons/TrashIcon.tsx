// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Trash from './source/trash.svg?react';

const TrashIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Trash} inheritViewBox />;

export default TrashIcon;
