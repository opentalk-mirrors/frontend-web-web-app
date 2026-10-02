// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import OpenInFull from './source/open-in-full.svg?react';

const OpenInFullIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={OpenInFull} />;

export default OpenInFullIcon;
