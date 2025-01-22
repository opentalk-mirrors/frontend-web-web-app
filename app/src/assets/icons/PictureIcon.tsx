// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Picture from './source/picture.svg?react';

const PictureIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Picture} />;

export default PictureIcon;
