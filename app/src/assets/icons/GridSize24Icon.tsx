// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import GridSize24 from './source/grid-size-24.svg?react';

const GridSize24Icon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={GridSize24} />;

export default GridSize24Icon;
