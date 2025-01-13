// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import RectAddPlus from './source/rect-add-plus.svg?react';

const RectAddPlusIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={RectAddPlus} />;

export default RectAddPlusIcon;
