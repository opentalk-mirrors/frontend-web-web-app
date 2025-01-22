// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Audio from './source/audio.svg?react';

const AudioIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Audio} />;

export default AudioIcon;
