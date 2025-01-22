// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Recordings from './source/recordings.svg?react';

const RecordingsIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Recordings} />;

export default RecordingsIcon;
