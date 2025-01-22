// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import NoPolls from './source/no-polls.svg?react';

const NoPollsIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={NoPolls} />;

export default NoPollsIcon;
