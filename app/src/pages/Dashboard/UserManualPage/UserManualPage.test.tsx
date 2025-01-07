// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '../../../utils/testUtils';
import UserManualPage from './UserManualPage';

jest.mock('../../../utils/apiUtils');

describe('User Manual Page', () => {
  it('renders the page and its header', async () => {
    await render(<UserManualPage />);
    const heading = screen.getByRole('heading', { name: 'dashboard-help-user-manual' });

    expect(heading).toBeInTheDocument();
  });
  it('sets the tab title', async () => {
    await render(<UserManualPage />);

    expect(document.title).toEqual('dashboard-help-user-manual' + ' in OpenTalk');
  });
});
