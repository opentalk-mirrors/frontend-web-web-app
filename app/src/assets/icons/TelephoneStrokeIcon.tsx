// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import TelephoneStroke from './source/telephone-stroke.svg?react';

const TelephoneStrokeIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={TelephoneStroke} />;

export default TelephoneStrokeIcon;
