// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import GridView from './source/grid-view.svg?react';

const GridViewIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={GridView} />;

export default GridViewIcon;
