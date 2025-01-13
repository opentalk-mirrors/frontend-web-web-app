// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import InfoOutlined from './source/info-outlined.svg?react';

const InfoOutlinedIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={InfoOutlined} />;

export default InfoOutlinedIcon;
