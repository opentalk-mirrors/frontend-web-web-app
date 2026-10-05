// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { configureStore, renderWithProviders } from '../../utils/testUtils';
import MenuTabs from './MenuTabs';

vi.mock('../Participants', () => ({
  __esModule: true,
  default: () => <div data-testid="Participants" />,
}));

vi.mock('../Chat', () => ({
  __esModule: true,
  default: () => <div data-testid="Chat" />,
}));

vi.mock('../ChatOverview', () => ({
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

    screen.getByRole('tab', { name: 'global-chat' });
    screen.getByRole('tab', { name: 'global-participants' });
    screen.getByRole('tab', { name: 'global-messages' });
  });

  it('renders chat tab panel by default', () => {
    const { store } = configureStore();
    renderWithProviders(<MenuTabs />, { store, provider: { mui: true } });

    const chatTabPanel = screen.getByRole('tabpanel', { name: 'global-chat' });
    expect(chatTabPanel).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'chatroom-hidden-heading', level: 3 })).toBeInTheDocument();
    expect(screen.getByTestId('Chat')).toBeInTheDocument();
  });

  it('renders chat overview when click on messages tab', async () => {
    const user = userEvent.setup();
    const { store } = configureStore();
    renderWithProviders(<MenuTabs />, { store, provider: { mui: true } });

    const messageTab = screen.getByRole('tab', { name: 'global-messages' });

    await user.click(messageTab);

    const messageTabPanel = screen.getByRole('tabpanel', { name: 'global-messages' });
    expect(messageTabPanel).toBeInTheDocument();
    expect(screen.getByTestId('ChatOverview')).toBeInTheDocument();
  });

  it('renders participants when click on people tab', async () => {
    const user = userEvent.setup();
    const { store } = configureStore();
    renderWithProviders(<MenuTabs />, { store, provider: { mui: true } });

    const peopleTab = screen.getByRole('tab', { name: 'global-participants' });

    await user.click(peopleTab);

    const peopleTabPanel = screen.getByRole('tabpanel', { name: 'global-participants' });
    expect(peopleTabPanel).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'participant-list-hidden-heading', level: 3 })).toBeInTheDocument();
    expect(screen.getByTestId('Participants')).toBeInTheDocument();
  });
});
