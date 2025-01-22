// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import SpeakerQueue from './source/speaker-queue.svg?react';

const SpeakerQueueIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={SpeakerQueue} />;

export default SpeakerQueueIcon;
