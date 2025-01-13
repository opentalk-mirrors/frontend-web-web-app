// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import NoOfRooms from './source/no-of-rooms.svg?react';

const NoOfRoomsIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={NoOfRooms} />;

export default NoOfRoomsIcon;
