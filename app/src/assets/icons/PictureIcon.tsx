// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Picture from './source/picture.svg?react';

const PictureIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Picture} inheritViewBox />;

export default PictureIcon;
