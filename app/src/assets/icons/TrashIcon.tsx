// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Trash from './source/trash.svg?react';

const TrashIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Trash} />;

export default TrashIcon;
