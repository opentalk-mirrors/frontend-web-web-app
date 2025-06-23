// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent, waitFor } from '@testing-library/react';

import { renderWithProviders, configureStore } from '../../utils/testUtils';
import MenuTabs from './MenuTabs';

describe('MenuTabs Component', () => {
  it('render MenuTabs component without crashing and initialy Chat Tab is selected', () => {
    const { store } = configureStore();
    renderWithProviders(<MenuTabs />, { store, provider: { mui: true } });

    const tablist = screen.getByRole('tablist');
    const tabs = screen.getAllByRole('tab');

    expect(tablist).toBeInTheDocument();
    expect(tabs).toHaveLength(3);

    const chatTab = screen.getByRole('tab', { name: /menutabs-chat/i });
    const peopleTab = screen.getByRole('tab', { name: /menutabs-people/i });
    const messageTab = screen.getByRole('tab', { name: /menutabs-message/i });

    expect(chatTab).toBeInTheDocument();
    expect(chatTab).toHaveAttribute('aria-selected', 'true');

    expect(peopleTab).toBeInTheDocument();
    expect(peopleTab).toHaveAttribute('aria-selected', 'false');

    expect(messageTab).toBeInTheDocument();
    expect(messageTab).toHaveAttribute('aria-selected', 'false');

    expect(screen.getByRole('button', { name: /chat-open-emoji-picker/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /chat-submit-button/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('chat-input-placeholder')).toBeInTheDocument();
  });

  it('click on MessageTab should mark tab as selected', () => {
    const { store } = configureStore();
    renderWithProviders(<MenuTabs />, { store, provider: { mui: true } });

    const chatTab = screen.getByRole('tab', { name: /menutabs-chat/i });
    const messageTab = screen.getByRole('tab', { name: /menutabs-message/i });

    expect(chatTab).toBeInTheDocument();
    expect(chatTab).toHaveAttribute('aria-selected', 'true');

    expect(messageTab).toBeInTheDocument();
    expect(messageTab).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(messageTab);

    expect(messageTab).toHaveAttribute('aria-selected', 'true');
    expect(chatTab).toHaveAttribute('aria-selected', 'false');
  });

  // TODO UNIT TEST  Warning: `NaN` is an invalid value for the `height` css style property. (root element is not available in unit tests)

  it('click on PeopleTab should mark tab as selected', async () => {
    const { store } = configureStore();
    renderWithProviders(<MenuTabs />, { store, provider: { mui: true } });

    const chatTab = screen.getByRole('tab', { name: /menutabs-chat/i });
    const peopleTab = screen.getByRole('tab', { name: /menutabs-people/i });

    expect(chatTab).toBeInTheDocument();
    expect(chatTab).toHaveAttribute('aria-selected', 'true');

    expect(peopleTab).toBeInTheDocument();
    expect(peopleTab).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(peopleTab);

    await waitFor(() => {
      expect(peopleTab).toHaveAttribute('aria-selected', 'true');
    });
    expect(chatTab).toHaveAttribute('aria-selected', 'false');
  });
});
