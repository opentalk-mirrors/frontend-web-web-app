// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import WhisperEmpty from './source/whisper-empty.svg?react';

const WhisperEmptyIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={WhisperEmpty} />;

export default WhisperEmptyIcon;
