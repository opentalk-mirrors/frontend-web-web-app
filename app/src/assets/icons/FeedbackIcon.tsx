// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Feedback from './source/feedback.svg?react';

const FeedbackIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Feedback} inheritViewBox />;

export default FeedbackIcon;
