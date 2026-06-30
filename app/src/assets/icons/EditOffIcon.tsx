// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import EditOff from './source/edit-off.svg?react';

const EditOffIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={EditOff} />;

export default EditOffIcon;
