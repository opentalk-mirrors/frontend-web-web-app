// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { test, expect } from '@playwright/test';

import { closeWebkitPopUp } from '../../helper/webkit';
import { HelpPage } from '../../pages/HelpPage';

test.beforeEach('Navigate to help option', async ({ page, browserName, context }) => {
  const helpPage = new HelpPage({ page, context });
  await helpPage.navigateToHelpPage();

  // Warning button in safari blocks the selector for creating new meeting
  if (browserName === 'webkit') {
    await closeWebkitPopUp({ page });
  }
});

test.describe('Dashboard_Help', () => {
  test('TC_001_Dashboard_Help_User Manual', async ({ page, context }) => {
    const helpPage = new HelpPage({ page, context });
    await expect(helpPage.helpHeading).toBeVisible();
    await expect(helpPage.userManualLink).toBeVisible();
    await expect(helpPage.supportLink).toBeVisible();

    const userManualDocsPage = await helpPage.navigateToUserManual();
    expect(userManualDocsPage.getByRole('heading', { name: 'User manual' })).toHaveText('User manual', {
      timeout: 10_000,
    });
    expect(userManualDocsPage.url()).toBe('https://docs.opentalk.eu/user/Handbuch/');
    await expect(
      userManualDocsPage.getByText(
        'Please contact your admin if this manual leaves any questions unanswered or if you have found a technical error. We hope you enjoy using OpenTalk!'
      )
    ).toBeVisible();

    await helpPage.page.bringToFront();
    await expect(helpPage.helpHeading).toBeVisible();
  });

  test.skip('TC_002_Dashboard_Help_Support', async ({ page, context }) => {
    const helpPage = new HelpPage({ page, context });

    const supportDocsPage = await helpPage.navigateToSupport();
    expect(supportDocsPage.title()).toBe('Contact our support team | OpenTalk');
    expect(supportDocsPage.url()).toBe('https://opentalk.eu/en/contact-our-support-team');

    expect(supportDocsPage.getByRole('heading', { name: 'User manual' })).toHaveText(
      'Do you have questions about our online service?'
    );

    expect(supportDocsPage.getByRole('button', { name: 'send' })).toBeVisible();

    await helpPage.page.bringToFront();
    await expect(helpPage.helpHeading).toBeVisible();
  });
});
