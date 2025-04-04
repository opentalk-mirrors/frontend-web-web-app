// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page } from '@playwright/test';

export const closeWebkitPopUp = async ({ page }: { page: Page }) => {
  const closeButton = await page.getByRole('button', { name: 'Ok', exact: true });
  await closeButton.click();
};
