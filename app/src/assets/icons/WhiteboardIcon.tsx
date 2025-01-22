// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Whiteboard from './source/whiteboard.svg?react';

const WhiteboardIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Whiteboard} />;

export default WhiteboardIcon;
