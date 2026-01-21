// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { notificationAction, notifications } from '../../commonComponents';
import type { RootState } from '../../store';
import {
  remainingUpdated as automodRemainingUpdated,
  speakerUpdated as automodSpeakerUpdated,
  started as automodStarted,
  stopped as automodStopped,
  setAsActiveSpeaker,
  setAsInactiveSpeaker,
} from '../../store/slices/automodSlice';
import { AutomodSelectionStrategy, ParticipantId } from '../../types';
import type { AutomodEventType, AutomodStartedEvent, AutomodSpeakerUpdatedEvent } from '../types/incoming/automod';
import { automod } from '../types/outgoing';
import { handleAutomodMessage, startedId } from './automod';

vi.mock('i18next', () => ({
  default: {
    t: vi.fn((key: string) => key),
  },
}));

vi.mock('../../commonComponents', () => ({
  createStackedMessages: vi.fn((messages: string[]) => messages.join(',')),
  notificationAction: vi.fn(),
  notifications: {
    close: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    showTalkingStickUnmutedNotification: vi.fn(),
    showTalkingStickMutedNotification: vi.fn(),
  },
}));

type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

const createState = (overrides: DeepPartial<RootState> = {}): RootState =>
  ({
    automod: {
      speakerState: 'inactive',
    },
    breakout: {
      currentBreakoutRoomId: null,
    },
    livekit: {
      mediaSettings: {
        microphoneEnabled: true,
      },
    },
    participants: {
      ids: [],
      entities: {},
    },
    user: {
      uuid: 'user-1',
    },
    ...overrides,
  }) as RootState;

const createStartedEvent = (overrides: Partial<AutomodStartedEvent> = {}): AutomodStartedEvent =>
  ({
    message: 'started',
    allowDoubleSelection: false,
    animationOnRandom: false,
    considerHandRaise: false,
    selectionStrategy: AutomodSelectionStrategy.Playlist,
    showList: true,
    history: [],
    remaining: [],
    issuedBy: 'user-1' as ParticipantId,
    ...overrides,
  }) as AutomodStartedEvent;

describe('handleAutomodMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles started event notifications and auto-selects next', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data = createStartedEvent();

    handleAutomodMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(automodStarted(data));
    expect(dispatch).toHaveBeenCalledWith(automod.selectNext.action());
    expect(notificationAction).toHaveBeenCalledWith(
      expect.objectContaining({ key: startedId, variant: 'info', ariaLive: 'polite' })
    );
    expect(notifications.warning).toHaveBeenCalledWith('talking-stick-participant-amount-notification');
  });

  it('handles stopped event notification', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: AutomodEventType = { message: 'stopped', reason: 'session_finished' };

    handleAutomodMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(automodStopped());
    expect(notificationAction).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'handleAutomodMessage-stopped-id',
        msg: 'talking-stick-finished',
        variant: 'info',
        ariaLive: 'polite',
      })
    );
  });

  it('updates remaining list on remaining_updated', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: AutomodEventType = {
      message: 'remaining_updated',
      remaining: ['user-2' as ParticipantId],
    };

    handleAutomodMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(automodRemainingUpdated(data));
  });

  it('handles speaker updates when another participant is speaking', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: AutomodSpeakerUpdatedEvent = {
      message: 'speaker_updated',
      speaker: 'user-2' as ParticipantId,
      remaining: ['user-1' as ParticipantId],
    };

    handleAutomodMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(setAsInactiveSpeaker());
    expect(dispatch).toHaveBeenCalledWith(automodSpeakerUpdated(data));
    expect(notificationAction).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'handleAutomodMessage-next-id',
        msg: 'talking-stick-next-announcement',
        variant: 'warning',
        ariaLive: 'polite',
        persist: true,
      })
    );
  });

  it('shows talking stick notification when we become the speaker', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: AutomodSpeakerUpdatedEvent = {
      message: 'speaker_updated',
      speaker: 'user-1' as ParticipantId,
      remaining: [],
    };

    handleAutomodMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(setAsActiveSpeaker());
    expect(dispatch).toHaveBeenCalledWith(automodSpeakerUpdated(data));
    expect(notifications.showTalkingStickUnmutedNotification).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'handleAutomodMessage-unmute-only-id' })
    );
  });

  it('throws on unknown message type', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data = { message: 'unknown' } as unknown as AutomodEventType;

    expect(() => handleAutomodMessage(dispatch, data, state)).toThrow(/Unknown message type/);
  });
});
