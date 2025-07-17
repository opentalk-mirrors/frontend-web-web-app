// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

export class MyMeetingsPage {
  private readonly page: Page;

  public readonly myMeetingsHeading: Locator;
  public readonly planNewLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.myMeetingsHeading = this.page.getByRole('heading', { name: /^(My Meetings|Meine Meetings)$/ });
    this.planNewLink = this.page.getByRole('link', { name: /^(Plan new|Meeting planen)$/ });
  }
}
