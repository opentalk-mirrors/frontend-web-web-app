// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Store, Dispatch } from '@reduxjs/toolkit';
import { waitFor } from '@testing-library/dom';

import { received } from '../../../store/slices/chatSlice';
import { ChatScope, ParticipantId, ChatMessage } from '../../../types';
import { render, screen, createStore } from '../../../utils/testUtils';
import ChatLiveRegion from './ChatLiveRegion';

const OUR_UUID = '1234546';

const mockOldGlobalMessage: ChatMessage = {
  id: '1',
  timestamp: '2025-01-09T14:16:08.136064605Z',
  source: '85e926ed-2e9d-47b3-9c2f-f37bd0bf3dd8' as ParticipantId,
  content: 'Hello',
  scope: ChatScope.Global,
};

jest.mock('./ChatAnnouncement', () => ({
  ...jest.requireActual('./ChatAnnouncement'),
  __esModule: true,
  default: () => <div data-testid="chat-announcement"></div>,
}));

describe('ChatLiveRegion', () => {
  let store: Store, dispatch: Dispatch;
  beforeEach(() => {
    const createdStore = createStore({
      initialState: {
        chat: {
          enabled: true,
          messages: {
            ids: ['1'],
            entities: {
              '1': mockOldGlobalMessage,
            },
          },
        },
        user: {
          uuid: OUR_UUID,
        },
      },
    });

    store = createdStore.store;
    dispatch = createdStore.dispatch;
  });
  it('renders the live region', async () => {
    await render(<ChatLiveRegion />, store);
    expect(screen.getByRole('log')).toBeInTheDocument();
  });
  it('does not announce messages, that were received before live region were rendered', async () => {
    await render(<ChatLiveRegion />, store);
    expect(screen.queryByTestId('chat-announcement')).not.toBeInTheDocument();
  });
  it('announces messages from other users, that were received after live region were rendered', async () => {
    await render(<ChatLiveRegion />, store);

    const mockNewGlobalMessage: ChatMessage = {
      ...mockOldGlobalMessage,
      id: '2',
      timestamp: new Date().toISOString(),
    };

    dispatch(received(mockNewGlobalMessage));

    await waitFor(() => {
      expect(screen.getByTestId('chat-announcement')).toBeInTheDocument();
    });
  });
  it('ignores messages from us, that were received after live region were rendered', async () => {
    await render(<ChatLiveRegion />, store);

    const mockNewGlobalMessageFromUs: ChatMessage = {
      ...mockOldGlobalMessage,
      id: '2',
      timestamp: new Date().toISOString(),
      source: OUR_UUID as ParticipantId,
    };

    dispatch(received(mockNewGlobalMessageFromUs));

    await waitFor(() => {
      expect(screen.queryByTestId('chat-announcement')).not.toBeInTheDocument();
    });
  });
});
