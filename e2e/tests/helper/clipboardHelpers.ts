// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page } from '@playwright/test';

export async function getClipboardContent(page: Page): Promise<string> {
  return await page.evaluate(() => navigator.clipboard.readText());
}
