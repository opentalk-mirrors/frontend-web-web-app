// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  setGlobalChatLastSeenTimestamp,
  setLastSeenTimestampForGroupChat,
  setLastSeenTimestampForPrivateChat,
} from '../../../store/slices/chatSlice';
import { ChatScope, GroupId, ParticipantId } from '../../../types';
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

    renderWithProviders(<ChatList scope={ChatScope.Global} />, { store });
    expect(dispatchSpy).toHaveBeenCalledWith(
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
      },
    });

    renderWithProviders(<ChatList scope={ChatScope.Private} targetId={targetId} />, { store });
    expect(dispatchSpy).toHaveBeenCalledWith(
      setLastSeenTimestampForPrivateChat({
        timestamp: expect.any(String),
        participantId: targetId,
      })
    );
  });
  it('updates the last seen timestamp for a group chat', () => {
    const targetId = 'group-123' as GroupId;
    const { store, dispatchSpy } = configureStore({
      initialState: {
        room: { isRoomDeleted: false },
        chat: {
          scope: {
            group: {
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
      },
    });

    renderWithProviders(<ChatList scope={ChatScope.Group} targetId={targetId} />, { store });
    expect(dispatchSpy).toHaveBeenCalledWith(
      setLastSeenTimestampForGroupChat({
        timestamp: expect.any(String),
        groupId: targetId,
      })
    );
  });
});
