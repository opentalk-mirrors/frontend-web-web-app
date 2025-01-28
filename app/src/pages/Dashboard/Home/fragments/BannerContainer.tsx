// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack } from '@mui/material';

import { PaymentStatusBanner } from './PaymentStatusBanner';
import { StorageAlmostFullBanner } from './StorageAlmostFullBanner';

const BannerContainer = () => {
  return (
    <Stack
      direction="column"
      sx={{
        gap: 1,
      }}
    >
      <PaymentStatusBanner />
      <StorageAlmostFullBanner />
    </Stack>
  );
};

export default BannerContainer;
