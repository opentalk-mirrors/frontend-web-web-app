// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent } from '@testing-library/react';

import { ModerationTabKey } from '../../config/constants';
import { Tab as TabProps } from '../../config/moderationTabs';
import { configureStore, renderWithProviders } from '../../utils/testUtils';
import ModerationSideToolbar from './ModerationSideToolbar';

describe('ModerationSideToolbar', () => {
  const mockOnSelect = vi.fn();
  const exampleTabs: TabProps[] = [
    {
      key: 'chat' as ModerationTabKey,
      icon: <svg data-testid="chat-icon" />,
      tooltipTranslationKey: 'tooltip.chat',
      disabled: false,
    },
    {
      key: 'divider1' as ModerationTabKey,
      divider: true,
    },
    {
      key: 'poll' as ModerationTabKey,
      icon: <svg data-testid="poll-icon" />,
      tooltipTranslationKey: 'tooltip.poll',
      disabled: true,
    },
    {
      key: 'vote' as ModerationTabKey,
      icon: <svg data-testid="vote-icon" />,
      tooltipTranslationKey: 'tooltip.vote',
      disabled: false,
    },
  ];

  const { store } = configureStore();
  const renderComponent = (activeTab: ModerationTabKey = 'chat' as ModerationTabKey) =>
    renderWithProviders(
      <ModerationSideToolbar onSelect={mockOnSelect} displayedTabs={exampleTabs} activeTab={activeTab} />,
      { store, provider: { mui: true } }
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tabs and dividers correctly', () => {
    renderComponent();
    expect(screen.getByTestId('chat-icon')).toBeInTheDocument();
    expect(screen.getByTestId('poll-icon')).toBeInTheDocument();
    expect(screen.getByRole('presentation')).toBeInTheDocument(); // Divider
  });

  it('calls onSelect with correct tabKey when a tab is clicked', () => {
    renderComponent();
    const chatTab = screen.getByRole('tab', { name: /vote/i });
    fireEvent.click(chatTab);
    expect(mockOnSelect).toHaveBeenCalledWith('vote');
  });

  it('renders tooltip content using translation keys', () => {
    renderComponent();

    expect(screen.getByLabelText('tooltip.chat')).toBeInTheDocument();
    expect(screen.getByLabelText('tooltip.poll')).toBeInTheDocument();
    expect(screen.getByLabelText('tooltip.vote')).toBeInTheDocument();
  });

  it('prevents clicking on disabled tab', () => {
    renderComponent();
    const disabledTab = screen.getByRole('tab', { name: /tooltip.poll/i });
    fireEvent.click(disabledTab);
    expect(mockOnSelect).not.toHaveBeenCalled();
  });
});
