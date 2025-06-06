// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BrowserContext } from '@playwright/test';

export async function navigateToExternalPage(context: BrowserContext, title: string) {
  await new Promise((res) => setTimeout(res, 5_000));
  const allOpenPages = context.pages();

  for (const page of allOpenPages) {
    if ((await page.title()) === title) {
      return page;
    }
  }
  return context.pages()[2];
}
