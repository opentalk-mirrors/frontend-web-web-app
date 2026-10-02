// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import CloseFullscreen from './source/close-fullscreen.svg?react';

const CloseFullscreenIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={CloseFullscreen} />;

export default CloseFullscreenIcon;
