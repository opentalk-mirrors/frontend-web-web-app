// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import SpeakerQueue from './source/speaker-queue.svg?react';

const SpeakerQueueIcon = (props: SvgIconProps) => <SvgIcon {...props} component={SpeakerQueue} inheritViewBox />;

export default SpeakerQueueIcon;
