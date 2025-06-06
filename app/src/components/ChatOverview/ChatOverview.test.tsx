// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../utils/testUtils';
import ChatOverview from './ChatOverview';

describe('ChatOverview', () => {
  it('renders empty message when no chats are present', () => {
    const { store } = configureStore({});
    renderWithProviders(<ChatOverview />, { store });
    expect(screen.getByText('empty-messages')).toBeInTheDocument();
  });
});
