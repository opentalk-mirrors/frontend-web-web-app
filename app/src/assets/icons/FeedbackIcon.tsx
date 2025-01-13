// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Feedback from './source/feedback.svg?react';

const FeedbackIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Feedback} />;

export default FeedbackIcon;
