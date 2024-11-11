// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import NoOfRooms from './source/no-of-rooms.svg?react';

const NoOfRoomsIcon = (props: SvgIconProps) => <SvgIcon {...props} component={NoOfRooms} inheritViewBox />;

export default NoOfRoomsIcon;
