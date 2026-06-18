// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Volume from './source/volume.svg?react';

const VolumeIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Volume} />;

export default VolumeIcon;
