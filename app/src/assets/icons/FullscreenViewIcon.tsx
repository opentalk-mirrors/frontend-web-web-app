// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import FullscreenView from './source/fullscreen-view.svg?react';

const FullscreenViewIcon = (props: SvgIconProps) => <SvgIcon {...props} component={FullscreenView} inheritViewBox />;

export default FullscreenViewIcon;
