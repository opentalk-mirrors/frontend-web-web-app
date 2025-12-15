// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, MenuItem } from '@mui/material';

const DeviceListMenuItem = styled(MenuItem)(() => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontSize: '0.875rem',
}));

export default DeviceListMenuItem;
