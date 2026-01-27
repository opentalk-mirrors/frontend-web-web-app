// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  setGlobalChatLastSeenTimestamp,
  setLastSeenTimestampForBreakoutChat,
  setLastSeenTimestampForPrivateChat,
} from '../../../store/slices/chatSlice';
import { ChatScope, ParticipantId } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import ChatList from './ChatList';

describe('updateLastSeenTimestamp', () => {
  beforeEach(() => {
    // Silence reselect warnings during tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('updates the last seen timestamp for a public chat', () => {
    const { store, dispatchSpy } = configureStore({
      initialState: {
        room: { isRoomDeleted: false },
        chat: {
          scope: {
            global: {
              messages: {
                ids: [],
                entities: {},
              },
              nextIndex: null,
              lastSeenTimestamp: null,
            },
          },
        },
      },
    });

    renderWithProviders(<ChatList />, { store });
    expect(dispatchSpy).toHaveBeenCalledExactlyOnceWith(
      setGlobalChatLastSeenTimestamp({
        value: expect.any(String),
      })
    );
  });
  it('updates the last seen timestamp for a private chat', () => {
    const targetId = 'participant-123' as ParticipantId;
    const { store, dispatchSpy } = configureStore({
      initialState: {
        room: { isRoomDeleted: false },
        chat: {
          scope: {
            private: {
              [targetId]: {
                messages: {
                  ids: [],
                  entities: {},
                },
                nextIndex: null,
                lastSeenTimestamp: null,
              },
            },
          },
        },
        ui: {
          chatConversationState: {
            scope: ChatScope.Private,
            targetId,
          },
          chatSearchValue: '',
        },
      },
    });

    renderWithProviders(<ChatList />, { store });
    expect(dispatchSpy).toHaveBeenCalledExactlyOnceWith(
      setLastSeenTimestampForPrivateChat({
        timestamp: expect.any(String),
        participantId: targetId,
      })
    );
  });
  it('updates the last seen timestamp for a breakout chat', () => {
    const { store, dispatchSpy } = configureStore({
      initialState: {
        room: { isRoomDeleted: false },
        chat: {
          scope: {
            breakout: {
              messages: {
                ids: [],
                entities: {},
              },
              nextIndex: null,
              lastSeenTimestamp: null,
            },
          },
        },
      },
    });

    renderWithProviders(<ChatList />, { store });
    expect(dispatchSpy).toHaveBeenCalledExactlyOnceWith(
      setLastSeenTimestampForBreakoutChat({
        timestamp: expect.any(String),
      })
    );
  });
});
