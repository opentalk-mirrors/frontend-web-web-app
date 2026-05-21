// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import GridSize16 from './source/grid-size-16.svg?react';

const GridSize16Icon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={GridSize16} />;

export default GridSize16Icon;
