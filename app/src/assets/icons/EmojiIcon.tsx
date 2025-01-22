// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Emoji from './source/emoji.svg?react';

const EmojiIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Emoji} />;

export default EmojiIcon;
