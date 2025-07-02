// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

export class GeneralPage {
  private readonly page: Page;

  public readonly languageHeading: Locator;
  public readonly languageDropdownMenu: {
    readonly selectedField: Locator;
    readonly optionsDropdown: Locator;
    readonly options: {
      readonly deutsch: Locator;
      readonly english: Locator;
    };
  };
  public readonly saveButton: Locator;
  public readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.languageHeading = this.page.getByRole('heading', { name: /^(Sprache|Language)$/ });
    this.languageDropdownMenu = {
      selectedField: this.page.getByRole('combobox', {
        name: /^(Language Deutsch|Language English|Sprache Deutsch|Sprache English)$/,
      }),
      optionsDropdown: this.page.getByRole('listbox', { name: /^(Sprache|Language)$/ }),
      options: {
        deutsch: this.page.getByRole('option', { name: 'Deutsch' }),
        english: this.page.getByRole('option', { name: 'English' }),
      },
    };
    this.saveButton = this.page.getByRole('button', { name: /^(Änderungen speichern|Save)$/ });
    this.successMessage = this.page.getByRole('alert').filter({ has: this.page.getByTestId('close-button') });
  }

  public async openLanguageDropdown(): Promise<void> {
    await this.languageDropdownMenu.selectedField.click();
  }

  public async selectLanguage(language: 'english' | 'deutsch'): Promise<void> {
    switch (language) {
      case 'english':
        await this.languageDropdownMenu.options.english.click();
        break;

      case 'deutsch':
        await this.languageDropdownMenu.options.deutsch.click();
        break;
    }
  }

  public async saveSelectedLanguage(): Promise<void> {
    await this.saveButton.click();
  }
}
