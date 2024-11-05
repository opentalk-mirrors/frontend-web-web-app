// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import SharedFolderSVG from './source/shared-folder.svg?react';

const SharedFolderIcon = (props: SvgIconProps) => <SvgIcon {...props} component={SharedFolderSVG} inheritViewBox />;

export default SharedFolderIcon;
