// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Moderator from './source/moderator.svg?react';

const ModeratorIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Moderator} inheritViewBox />;

export default ModeratorIcon;
