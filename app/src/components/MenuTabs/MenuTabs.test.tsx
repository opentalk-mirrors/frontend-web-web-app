// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, fireEvent, configureStore, waitFor } from '../../utils/testUtils';
import MenuTabs from './MenuTabs';

describe('MenuTabs Component', () => {
  test('render MenuTabs component without crashing and initialy Chat Tab is selected', async () => {
    const { store } = configureStore();
    await render(<MenuTabs />, store);

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

  test('click on MessageTab should mark tab as selected', async () => {
    const { store } = configureStore();
    await render(<MenuTabs />, store);

    const chatTab = screen.getByRole('tab', { name: /menutabs-chat/i });
    const messageTab = screen.getByRole('tab', { name: /menutabs-message/i });

    expect(chatTab).toBeInTheDocument();
    expect(chatTab).toHaveAttribute('aria-selected', 'true');

    expect(messageTab).toBeInTheDocument();
    expect(messageTab).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(messageTab);

    await waitFor(() => {
      expect(messageTab).toHaveAttribute('aria-selected', 'true');
      expect(chatTab).toHaveAttribute('aria-selected', 'false');
    });
  });

  test('click on PeopleTab should mark tab as selected', async () => {
    const { store } = configureStore();
    await render(<MenuTabs />, store);

    const chatTab = screen.getByRole('tab', { name: /menutabs-chat/i });
    const peopleTab = screen.getByRole('tab', { name: /menutabs-people/i });

    expect(chatTab).toBeInTheDocument();
    expect(chatTab).toHaveAttribute('aria-selected', 'true');

    expect(peopleTab).toBeInTheDocument();
    expect(peopleTab).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(peopleTab);

    await waitFor(() => {
      expect(peopleTab).toHaveAttribute('aria-selected', 'true');
      expect(chatTab).toHaveAttribute('aria-selected', 'false');
    });
  });
});
