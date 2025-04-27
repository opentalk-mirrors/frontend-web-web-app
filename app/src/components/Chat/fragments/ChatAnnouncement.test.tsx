// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, waitFor } from '@testing-library/react';

import { ChatScope, ChatMessage, ParticipantId } from '../../../types';
import ChatAnnouncement from './ChatAnnouncement';

const mockGlobalChatMessage: ChatMessage = {
  timestamp: '2025-01-09T14:16:08.136064605Z',
  id: '39beecb1-33fb-4f7e-9473-9710b32d1639',
  source: '85e926ed-2e9d-47b3-9c2f-f37bd0bf3dd8' as ParticipantId,
  content: 'Hello',
  scope: ChatScope.Global,
};

jest.mock('../../../hooks', () => ({
  useAppSelector: jest.fn(),
}));

// To reduce test execution time
jest.mock('./constants', () => ({
  ANNOUNCEMENT_TIMEOUT: 100,
}));

describe('ChatAnnouncement', () => {
  it('renders announcement', () => {
    render(<ChatAnnouncement message={mockGlobalChatMessage} onAnnouncementEnd={jest.fn()} />);

    expect(screen.getByText('chat-live-message-announcemenet')).toBeInTheDocument();
  });

  it('executes callback after announcement end', async () => {
    const onAnnouncementEnd = jest.fn();
    render(<ChatAnnouncement message={mockGlobalChatMessage} onAnnouncementEnd={onAnnouncementEnd} />);

    await waitFor(() => {
      expect(onAnnouncementEnd).toHaveBeenCalledTimes(1);
    });
  });
});
