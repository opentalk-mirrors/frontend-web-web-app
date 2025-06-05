// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { closeWebkitPopUp } from '../../helper/webkit';
import { LegalPage } from '../../pages/LegalPage';

test.beforeEach(async ({ page, browserName, context }) => {
  const legalPage = new LegalPage({ page, context });
  await legalPage.navigateToLegalPage();

  if (browserName === 'webkit') {
    await closeWebkitPopUp({ page });
  }
});

test.describe('Dashboard_Legal', () => {
  test('TC_001_Dashboard_Legal_Imprint & Data Protection', async ({ page, context }) => {
    const legalPage = new LegalPage({ page, context });
    await expect(legalPage.title).toHaveText('Legal');
    await expect(legalPage.imprintLink).toBeVisible();
    await expect(legalPage.dataProtectionLink).toBeVisible();

    const openTalkImprintPage = await legalPage.navigateToImprintPage();
    await expect(openTalkImprintPage).toHaveURL('https://opentalk.eu/en/terms-of-use');

    await expect(openTalkImprintPage).toHaveTitle('Terms of Use for OpenTalk-as-a-Service | OpenTalk');
    const choiceOfLawHeading = openTalkImprintPage.getByRole('heading', {
      name: '§ 8 – Choice of Law, Place of Jurisdiction, Severability Clause',
      exact: true,
    });
    await expect(choiceOfLawHeading).toBeVisible();

    await legalPage.page.bringToFront();
    await expect(legalPage.title).toHaveText('Legal');

    const openTalkDataProtectionPage = await legalPage.navigateToDataProtectionPage();
    await expect(openTalkDataProtectionPage).toHaveURL('https://opentalk.eu/en/data-protection');

    await expect(openTalkDataProtectionPage).toHaveTitle('Data Protection Notice | OpenTalk');
    const dataProtectionOfficerHeading = openTalkDataProtectionPage.getByRole('heading', {
      name: '13. Our data protection officer',
      exact: true,
    });
    await expect(dataProtectionOfficerHeading).toBeVisible();

    await legalPage.page.bringToFront();
    await expect(legalPage.title).toHaveText('Legal');
  });
});
