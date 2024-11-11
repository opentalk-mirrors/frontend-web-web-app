// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Recordings from './source/recordings.svg?react';

const RecordingsIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Recordings} inheritViewBox />;

export default RecordingsIcon;
