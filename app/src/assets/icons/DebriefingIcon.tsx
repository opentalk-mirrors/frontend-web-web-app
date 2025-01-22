// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Debriefing from './source/debriefing.svg?react';

const DebriefingIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Debriefing} />;

export default DebriefingIcon;
