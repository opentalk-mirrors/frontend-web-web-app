// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Edit from './source/edit.svg?react';

const EditIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Edit} />;

export default EditIcon;
