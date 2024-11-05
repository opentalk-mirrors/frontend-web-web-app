// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import SpeakerView from './source/speaker-view.svg?react';

const SpeakerViewIcon = (props: SvgIconProps) => <SvgIcon {...props} component={SpeakerView} inheritViewBox />;

export default SpeakerViewIcon;
