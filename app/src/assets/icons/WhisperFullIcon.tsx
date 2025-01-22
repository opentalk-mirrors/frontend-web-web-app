// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import WhisperFull from './source/whisper-full.svg?react';

const WhisperFullIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={WhisperFull} />;

export default WhisperFullIcon;
