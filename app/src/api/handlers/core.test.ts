// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { RootState } from '../../store';
import { joinSuccess } from '../../store/commonActions';
import { waitingRoomJoined } from '../../store/slices/participantsSlice';
import { Role } from '../../types';
import type { JoinSuccessInternalState, ModuleData, ParticipantId, Timestamp } from '../../types';
import { JoinedWaitingRoom } from '../types/incoming/core';
import type { JoinSuccess } from '../types/incoming/core';
import { handleRoomServerCoreMessage } from './core';

vi.mock('i18next', () => ({
  default: {
    t: vi.fn((key: string) => key),
  },
}));

vi.mock('../../i18n', () => ({
  default: {
    changeLanguage: vi.fn(),
  },
}));

vi.mock('../../commonComponents', () => ({
  notifications: {
    info: vi.fn(),
    warning: vi.fn(),
  },
  setLibravatarOptions: vi.fn(() => 'mocked-avatar'),
}));

type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

const createState = (overrides: DeepPartial<RootState> = {}): RootState =>
  ({
    moderation: {
      forceMute: {
        unrestrictedParticipants: [],
      },
    },
    config: {
      libravatarDefaultImage: 'robohash',
      spacedeck: { enabled: false },
    },
    participants: {
      entities: {},
    },
    user: {
      uuid: 'participant-1',
      role: Role.User,
    },
    ...overrides,
  }) as RootState;

const timestamp = '2024-01-01T12:00:00Z' as Timestamp;

const baseModuleData = {
  chat: { enabled: true },
  livekit: { room: 'room', token: 'token', publicUrl: 'https://example.test' },
} as unknown as ModuleData;

const makeJoinSuccess = (moduleData: ModuleData): JoinSuccess =>
  ({
    message: 'join_success',
    id: 'participant-1' as ParticipantId,
    connectionId: 'conn-1',
    connections: [],
    role: Role.User,
    displayName: 'Me',
    isRoomOwner: false,
    tariff: { quotas: {} },
    enabledModules: {},
    participants: [],
    meetingDetails: {},
    roomInfo: {},
    moduleData,
  }) as unknown as JoinSuccess;

const getJoinSuccessPayload = (dispatch: ReturnType<typeof vi.fn>): JoinSuccessInternalState => {
  const call = dispatch.mock.calls.find(([action]) => joinSuccess.match(action));
  if (!call) {
    throw new Error('joinSuccess action was not dispatched');
  }
  return call[0].payload;
};

describe('handleRoomServerCoreMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps waiting room participant avatar before dispatching', () => {
    const dispatch = vi.fn();
    const state = createState();
    const participantId = 'participant-2' as ParticipantId;
    const data: JoinedWaitingRoom = {
      message: 'joined_waiting_room',
      participantId,
      connectionIds: [],
      joinedAt: '2024-01-01T10:00:00Z' as Timestamp,
      displayName: 'Alex',
    };

    handleRoomServerCoreMessage(dispatch, data, timestamp, state);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(
      waitingRoomJoined({
        ...data,
      })
    );
  });

  describe('join_success module forwarding', () => {
    it('forwards the reaction restrictions from moduleData into the joinSuccess payload', () => {
      const dispatch = vi.fn();
      const reaction = { restrictions: { type: 'enabled', unrestrictedParticipants: ['participant-1'] } };
      const moduleData = { ...baseModuleData, reaction } as unknown as ModuleData;

      handleRoomServerCoreMessage(dispatch, makeJoinSuccess(moduleData), timestamp, createState());

      expect(getJoinSuccessPayload(dispatch).reaction).toEqual(reaction);
    });

    // Every module that can arrive in `moduleData` must be acknowledged here: either map it to
    // where it surfaces in the joinSuccess payload, or use `null` when it is applied through a
    // different dispatch (e.g. whiteboard). Because this is a `Record<keyof ModuleData, ...>`,
    // adding a new module to `ModuleData` without updating this map is a compile error. That
    // forces a conscious decision and prevents silently dropping the new module's join data -
    // the exact bug that previously hid the reaction restrictions.
    const moduleForwarding: Record<keyof ModuleData, ((payload: JoinSuccessInternalState) => unknown) | null> = {
      chat: (payload) => payload.chat,
      livekit: (payload) => payload.livekit,
      automod: (payload) => payload.automod,
      breakout: (payload) => payload.breakout,
      moderation: (payload) => payload.moderation,
      recording: (payload) => payload.recording,
      timer: (payload) => payload.timer,
      legalVote: (payload) => payload.votes,
      polls: (payload) => payload.polls,
      sharedFolder: (payload) => payload.sharedFolder,
      trainingParticipationReport: (payload) => payload.trainingParticipationReport,
      reaction: (payload) => payload.reaction,
      raiseHands: (payload) => payload.raiseHands,
      whiteboard: null, // applied via setWhiteboardAvailable, not the joinSuccess payload
      excalidraw: null, // applied via updateRemoteScene / setEditRestrictions
    };

    // Sentinels are shaped to avoid the handler's side-effect branches (extra dispatches), so that
    // each run dispatches the joinSuccess action exactly once.
    const moduleSentinels: Record<keyof ModuleData, unknown> = {
      chat: { enabled: true },
      livekit: { room: 'room', token: 'token', publicUrl: 'https://example.test' },
      automod: { config: { selectionStrategy: 'none' } },
      breakout: { room: { kind: 'breakout', id: 1 } },
      moderation: { waitingRoom: 'disabled', waitingRoomParticipants: [] },
      recording: { recordingState: { status: 'inactive' }, streamStates: {} },
      timer: { style: 'normal' },
      legalVote: { votes: [] },
      polls: { id: 'poll-1' },
      sharedFolder: { read: {} },
      trainingParticipationReport: { state: 'disabled' },
      reaction: { restrictions: { type: 'disabled' } },
      whiteboard: { status: 'not_initialized' },
      excalidraw: { scene: {} },
      raiseHands: { raiseHandsEnabled: true, state: { raisedAt: new Date().toISOString() } },
    };

    const forwardedModules = Object.entries(moduleForwarding).filter(
      (entry): entry is [keyof ModuleData, (payload: JoinSuccessInternalState) => unknown] => entry[1] !== null
    );

    it.each(forwardedModules)('forwards moduleData.%s into the joinSuccess payload', (key, select) => {
      const dispatch = vi.fn();
      const moduleData = { ...baseModuleData, [key]: moduleSentinels[key] } as unknown as ModuleData;

      handleRoomServerCoreMessage(dispatch, makeJoinSuccess(moduleData), timestamp, createState());

      expect(select(getJoinSuccessPayload(dispatch))).toBeDefined();
    });
  });
});
