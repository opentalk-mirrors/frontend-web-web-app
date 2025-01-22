// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Poll from './source/poll.svg?react';

const PollIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Poll} />;

export default PollIcon;
