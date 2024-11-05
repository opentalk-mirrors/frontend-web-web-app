// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Emoji from './source/emoji.svg?react';

const EmojiIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Emoji} inheritViewBox />;

export default EmojiIcon;
