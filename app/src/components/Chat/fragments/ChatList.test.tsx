// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { lastSeenTimestampAdded } from '../../../store/slices/chatSlice';
import { BreakoutRoomId, ChatScope, ParticipantId } from '../../../types';
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
      lastSeenTimestampAdded({
        scope: ChatScope.Global,
        timestamp: expect.any(String),
      })
    );
  });
  it('updates the last seen timestamp for a private chat', () => {
    const target = 'participant-123' as ParticipantId;
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
            breakout: {
              [target]: {
                messages: {
                  ids: [],
                  entities: {},
                },
                nextIndex: null,
                lastSeenTimestamp: null,
              },
            },
            private: {
              [target]: {
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
            target,
          },
          chatSearchValue: '',
        },
      },
    });

    renderWithProviders(<ChatList />, { store });
    expect(dispatchSpy).toHaveBeenCalledExactlyOnceWith(
      lastSeenTimestampAdded({
        scope: ChatScope.Private,
        timestamp: expect.any(String),
        target: target,
      })
    );
  });
  it('updates the last seen timestamp for a breakout chat', () => {
    const target = 1 as BreakoutRoomId;
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
            breakout: {
              [target]: {
                messages: {
                  ids: [],
                  entities: {},
                },
                nextIndex: null,
                lastSeenTimestamp: null,
              },
            },
            private: {
              [target]: {
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
            scope: ChatScope.Breakout,
            target,
          },
          chatSearchValue: '',
        },
      },
    });

    renderWithProviders(<ChatList />, { store });
    expect(dispatchSpy).toHaveBeenCalledExactlyOnceWith(
      lastSeenTimestampAdded({
        scope: ChatScope.Breakout,
        timestamp: expect.any(String),
        target: target,
      })
    );
  });
});
