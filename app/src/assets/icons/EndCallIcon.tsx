// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import EndCall from './source/end-call.svg?react';

const EndCallIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={EndCall} />;

export default EndCallIcon;
