// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { IconButton as MuiIconButton } from '@mui/material';

/**
 * IconButton with variant re-export
 *
 * Adds the possible variant toolbar to the IconButton of MUI which currently does not have a
 * IconButtonVariantOverrides interface
 */

const IconButton = MuiIconButton;

export default IconButton;
