// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import NoVotes from './source/no-votes.svg?react';

const NoVotesIcon = (props: SvgIconProps) => <SvgIcon {...props} component={NoVotes} inheritViewBox />;

export default NoVotesIcon;
