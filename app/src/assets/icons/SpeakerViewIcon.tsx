// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import SpeakerView from './source/speaker-view.svg?react';

const SpeakerViewIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={SpeakerView} />;

export default SpeakerViewIcon;
