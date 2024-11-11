// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import TelephoneStroke from './source/telephone-stroke.svg?react';

const TelephoneStrokeIcon = (props: SvgIconProps) => <SvgIcon {...props} component={TelephoneStroke} inheritViewBox />;

export default TelephoneStrokeIcon;
