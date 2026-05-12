// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import GridSize9 from './source/grid-size-9.svg?react';

const GridSize9Icon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={GridSize9} />;

export default GridSize9Icon;
