// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import SharedFolder from './source/shared-folder.svg?react';

const SharedFolderIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={SharedFolder} />;

export default SharedFolderIcon;
