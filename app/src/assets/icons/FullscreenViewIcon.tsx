// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import FullscreenView from './source/fullscreen-view.svg?react';

const FullscreenViewIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={FullscreenView} />;

export default FullscreenViewIcon;
