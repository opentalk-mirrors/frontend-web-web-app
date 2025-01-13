// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Close from './source/close.svg?react';

const CloseIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Close} />;

export default CloseIcon;
