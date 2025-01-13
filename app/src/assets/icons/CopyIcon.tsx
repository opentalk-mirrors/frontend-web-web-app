// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Copy from './source/copy.svg?react';

const CopyIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Copy} />;

export default CopyIcon;
