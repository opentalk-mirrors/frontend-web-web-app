// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import DocumentationPage from './UserManualPage';

jest.mock('../../../utils/apiUtils');

jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => null),
      },
    };
  },
  initReactI18next: {
    type: '3rdParty',
    init: () => null,
  },
}));

describe('User Manual Page', () => {
  it('renders the page and its header', () => {
    render(<DocumentationPage />);

    const heading = screen.getByRole('heading', { name: 'dashboard-help-user-manual' });
    expect(heading).toBeInTheDocument();
  });
  it('sets the tab title', () => {
    render(<DocumentationPage />);

    expect(document.title).toEqual('dashboard-help-user-manual' + ' in OpenTalk');
  });
});
