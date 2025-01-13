// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import NoVotes from './source/no-votes.svg?react';

const NoVotesIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={NoVotes} />;

export default NoVotesIcon;
