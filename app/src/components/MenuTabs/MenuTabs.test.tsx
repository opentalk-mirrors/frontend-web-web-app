// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../utils/testUtils';
import MenuTabs from './MenuTabs';

jest.mock('../Participants', () => ({
  __esModule: true,
  default: () => <div data-testid="Participants" />,
}));

jest.mock('../Chat', () => ({
  __esModule: true,
  default: () => <div data-testid="Chat" />,
}));

jest.mock('../ChatOverview', () => ({
  __esModule: true,
  default: () => <div data-testid="ChatOverview" />,
}));

describe('MenuTabs Component', () => {
  it('renders menu tabs and chat tab is selected by default', () => {
    const { store } = configureStore();
    renderWithProviders(<MenuTabs />, { store, provider: { mui: true } });

    expect(screen.getByRole('heading', { name: 'menutabs-area-hidden-heading', level: 2 })).toBeInTheDocument();

    const tablist = screen.getByRole('tablist');
    const tabs = screen.getAllByRole('tab');

    expect(tablist).toBeInTheDocument();
    expect(tabs).toHaveLength(3);

    screen.getByRole('tab', { name: 'menutabs-chat' });
    screen.getByRole('tab', { name: 'menutabs-people' });
    screen.getByRole('tab', { name: 'menutabs-messages' });
  });

  it('renders chat tab panel by default', () => {
    const { store } = configureStore();
    renderWithProviders(<MenuTabs />, { store, provider: { mui: true } });

    const chatTabPanel = screen.getByRole('tabpanel', { name: 'menutabs-chat' });
    expect(chatTabPanel).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'chatroom-hidden-heading', level: 3 })).toBeInTheDocument();
    expect(screen.getByTestId('Chat')).toBeInTheDocument();
  });

  it('renders chat overview when click on messages tab', () => {
    const { store } = configureStore();
    renderWithProviders(<MenuTabs />, { store, provider: { mui: true } });

    const messageTab = screen.getByRole('tab', { name: 'menutabs-messages' });

    fireEvent.click(messageTab);

    const messageTabPanel = screen.getByRole('tabpanel', { name: 'menutabs-messages' });
    expect(messageTabPanel).toBeInTheDocument();
    expect(screen.getByTestId('ChatOverview')).toBeInTheDocument();
  });

  it('renders participants when click on people tab', () => {
    const { store } = configureStore();
    renderWithProviders(<MenuTabs />, { store, provider: { mui: true } });

    const peopleTab = screen.getByRole('tab', { name: 'menutabs-people' });

    fireEvent.click(peopleTab);

    const peopleTabPanel = screen.getByRole('tabpanel', { name: 'menutabs-people' });
    expect(peopleTabPanel).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'participant-list-hidden-heading', level: 3 })).toBeInTheDocument();
    expect(screen.getByTestId('Participants')).toBeInTheDocument();
  });
});
