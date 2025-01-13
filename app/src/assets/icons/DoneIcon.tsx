// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Done from './source/done.svg?react';

const DoneIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Done} />;

export default DoneIcon;
