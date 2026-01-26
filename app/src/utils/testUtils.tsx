// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ThemeProvider } from '@mui/material';
import '@mui/material';
import {
  BaseAsset,
  DateTime,
  Email,
  EventId,
  EventType,
  InviteStatus,
  RecurrencePattern,
  RecurringEvent,
  RoomId,
  RoomInvite,
  SingleEvent,
  TimelessEvent,
  UserId,
  PlatformKind,
  StreamingTarget,
  AssetId,
  InviteCode,
  SipId,
  ThemeBasePalette,
} from '@opentalk/rest-api-rtk-query';
import { ConfigureStoreOptions, Store } from '@reduxjs/toolkit';
import { RenderOptions, RenderResult, render as rtlRender, renderHook as rtlRenderHook } from '@testing-library/react';
import i18n from 'i18next';
import {
  Participant as LivekitParticipant,
  LocalTrackPublication,
  RemoteTrackPublication,
  Track,
} from 'livekit-client';
import { range } from 'lodash';
import React, { PropsWithChildren } from 'react';
import { initReactI18next } from 'react-i18next';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { MockInstance } from 'vitest';

import { createOpenTalkTheme } from '../assets/themes/opentalk';
import { defaultDarkModeColors, defaultLightModeColors } from '../assets/themes/opentalk/palette';
import { SnackbarProvider } from '../commonComponents';
import { MeetingFormValues } from '../components/MeetingForms/fragments/DashboardDateTimePicker';
import { MediaDescriptor } from '../modules/WebRTC';
import { AppDispatch, setupStore } from '../store';
import { AutomodState, SpeakerState } from '../store/slices/automodSlice';
import { Poll } from '../store/slices/pollSlice';
import {
  AutomodSelectionStrategy,
  LegalVote,
  LegalVoteId,
  LegalVoteKind,
  LegalVoteState,
  MeetingNotesAccess,
  Participant,
  ParticipantId,
  ParticipationKind,
  PollId,
  Role,
  WaitingState,
} from '../types';
import { CommonFrequencies } from './rruleUtils';
import { getRandomTimeInThePast } from './timeUtils';

const automodState: AutomodState = {
  active: false,
  selectionStrategy: AutomodSelectionStrategy.Playlist,
  history: {
    ids: [],
    entities: {},
  },
  remaining: {
    ids: [],
    entities: {},
  },
  animationOnRandom: false,
  allowDoubleSelection: false,
  timeLimit: null,
  showList: false,
  speakerState: SpeakerState.Inactive,
  considerHandRaise: false,
};

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',

  // have a common namespace used around the full app
  ns: ['translationsNS'],
  defaultNS: 'translationsNS',

  debug: false,

  interpolation: {
    escapeValue: false, // not needed for react!!
  },

  resources: {
    en: {},
    de: {},
  },
});

type MockReduxStore = {
  store: ReturnType<typeof setupStore>;
  dispatchSpy: MockInstance<AppDispatch>;
};

export const configureStore = (options?: ConfigureStoreOptions['preloadedState'] | undefined): MockReduxStore => {
  const store = setupStore(options?.initialState);

  const dispatchSpy = vi.spyOn(store, 'dispatch');

  return { store, dispatchSpy };
};

interface Render {
  options?: RenderOptions;
  store?: Store;
  provider?: {
    mui?: boolean;
    router?: boolean;
    snackbar?: boolean;
  };
}

const palette: ThemeBasePalette = {
  light: defaultLightModeColors,
  dark: defaultDarkModeColors,
};

export const renderWithProviders = (
  component: React.ReactElement,
  { options, store, provider }: Render
): RenderResult => {
  const WrappedComponent = ({ children }: { children: React.ReactElement }): React.ReactElement => {
    let component = children;

    if (provider?.snackbar) {
      component = <SnackbarProvider>{component}</SnackbarProvider>;
    }
    if (provider?.router) {
      component = <MemoryRouter>{component}</MemoryRouter>;
    }
    if (provider?.mui) {
      component = <ThemeProvider theme={createOpenTalkTheme('dark', palette)}>{component}</ThemeProvider>;
    }
    if (store) {
      component = <Provider store={store}>{component}</Provider>;
    }
    return component;
  };

  return rtlRender(<WrappedComponent>{component}</WrappedComponent>, options);
};
export const renderHookWithProviders = <Props, Result>(
  render: (initialProps: Props) => Result,
  { options, store }: Render
) => {
  const WrappedComponent = ({ children }: PropsWithChildren<object>) =>
    store ? <Provider store={store}>{children}</Provider> : <>{children}</>;

  return rtlRenderHook(render, { wrapper: WrappedComponent, ...options });
};

export const jwtVariables = {
  NAME: 'Jürgen Tests',
  TOKEN:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiSsO8cmdlbiBUZXN0cyJ9.t9f4AJVApbVfSWUJetD7qAOF-UQvebb3eVuDtE8RmHY',
};

/*
 * const mockStore
 * create participants and use them to create a redux store for testing.
 *
 * @params participantCount: number of mocked participants
 * @params options: a set of options related to participant state
 * @returns mocked redux store for testing
 */

export const mockStore = (
  participantCount: number,
  options?: {
    raiseHands?: number;
    automodActive?: boolean;

    role?: Role[];
    participantKinds?: ParticipationKind[];
    store?: ConfigureStoreOptions['preloadedState'];
    e2eEncryption?: boolean;
    randomizeJoinTime?: boolean;
  }
) => {
  const now = new Date();
  const participantsIds = range(participantCount);
  if (options?.participantKinds && participantCount < options.participantKinds.length) {
    throw new Error('participant count cannot be smaller than participant kinds');
  }
  const participants = participantsIds.map((index) => {
    const handIsUp = index < (options?.raiseHands || 0);
    const kind = options?.participantKinds?.[index];
    const role = options?.role?.[index];

    const joinedAt = (options?.randomizeJoinTime ? getRandomTimeInThePast(now, { minutes: 60 }) : now).toISOString();
    const participant = {
      ...mockedParticipant(index, kind, role),
      handIsUp,
      joinedAt,
    };
    return participant;
  });

  const initialState = {
    participants: {
      ids: participants.map((p) => p.id),
      entities: participants.reduce((entities: Record<ParticipantId, Participant>, participant) => {
        entities[participant.id] = participant;
        return entities;
      }, {}),
    },
    automod: {
      ...automodState,
      active: options?.automodActive,
    },
    room: {
      eventInfo: {
        e2eEncryption: options?.e2eEncryption || false,
      },
    },
    ...options?.store?.initialState,
  };

  return configureStore({
    initialState,
  });
};

export const mockedParticipant = (
  index: number,
  kind: ParticipationKind = ParticipationKind.User,
  role: Role = Role.User
): Participant & {
  identity: string;
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  getTrackPublication: () => LocalTrackPublication | undefined;
  setMicrophoneEnabled: (enabled: boolean) => LocalTrackPublication | undefined;
  videoTrackPublications: Map<string, RemoteTrackPublication>;
} => ({
  id: `00000000-e6b4-4759-00${index}` as ParticipantId,
  identity: `00000000-e6b4-4759-00${index}`, //some components while using livekit participants require identity as id -> TODO: map old participants type to Livekit Participant
  displayName: `Test User Randy Mock${index}`,
  handIsUp: false,
  handUpdatedAt: '2022-03-23T12:32:30Z',
  joinedAt: '2022-03-23T12:32:30Z',
  leftAt: null,
  breakoutRoomId: null,
  groups: [],
  participationKind: kind,
  lastActive: '2022-03-23T12:32:30Z',
  waitingState: WaitingState.Joined,
  meetingNotesAccess: MeetingNotesAccess.None,
  isRoomOwner: false,
  isCameraEnabled: false,
  isMicrophoneEnabled: false,
  getTrackPublication: () => undefined,
  setMicrophoneEnabled: () => undefined,
  videoTrackPublications: new Map(),
  role,
});

export const mockedLivekitParticipant = (index: number) => {
  return new LivekitParticipant(
    `00000000-e6b4-4759-00${index}`,
    `00000000-e6b4-4759-00${index}`,
    `Test User Randy Mock${index}`
  );
};

export const mockedVideoMediaDescriptor = (index: number) =>
  ({
    participantId: mockedParticipant(index).id,
    mediaType: Track.Source.Camera,
  }) as MediaDescriptor;

export const mockedScreenMediaDescriptor = (index: number) =>
  ({
    participantId: mockedParticipant(index).id,
    mediaType: Track.Source.ScreenShare,
  }) as MediaDescriptor;

export const mockedAudioInputs: Array<MediaDeviceInfo> = [
  {
    deviceId: 'audioInput1',
    groupId: 'group1',
    kind: 'audioinput',
    label: 'Audio Input 1',
    toJSON: vi.fn(),
  },
  {
    deviceId: 'audioInput2',
    groupId: 'group1',
    kind: 'audioinput',
    label: 'Audio Input 2',
    toJSON: vi.fn(),
  },
];

export const mockedVideoInputs: Array<MediaDeviceInfo> = [
  {
    deviceId: 'videoInput1',
    groupId: 'group1',
    kind: 'videoinput',
    label: 'Video Input 1',
    toJSON: vi.fn(),
  },
  {
    deviceId: 'videoInput2',
    groupId: 'group1',
    kind: 'videoinput',
    label: 'Video Input 2',
    toJSON: vi.fn(),
  },
];

export const eventMockedData: TimelessEvent = {
  id: uuidv4() as EventId,
  createdAt: '2022-04-06T13:57:38.793602Z' as DateTime,
  inviteStatus: InviteStatus.Accepted,
  isTimeIndependent: true,
  isFavorite: true,
  createdBy: {
    displayName: 'Test User',
    email: 'test@heinlein-video.de' as Email,
    firstname: 'FirstTest',
    id: '3645d74d-9a4b-4cd4-9d9f-f1871c970167' as UserId,
    lastname: 'LastTest',
    title: '',
  },
  title: 'Here is a very long test title for the event',
  description: 'Here is a description for the event',
  room: {
    id: uuidv4() as RoomId,
    waitingRoom: false,
    e2eEncryption: false,
  },
  type: EventType.Single,
  updatedBy: {
    displayName: 'Test User',
    email: 'test@heinlein-video.de' as Email,
    firstname: 'FirstTest',
    id: '3645d74d-9a4b-4cd4-9d9f-f1871c970167' as UserId,
    lastname: 'LastTest',
    title: '',
  },
  updatedAt: '2022-04-06T13:57:38.793602Z' as DateTime,
  isAdhoc: false,
  showMeetingDetails: false,
};

export const mockedExpiringDateRoomInvite: RoomInvite = {
  inviteCode: 'string' as InviteCode,
  created: '2019-08-24T14:15:22Z' as DateTime,
  createdBy: {
    id: '497f6eca-6276-4993-bfeb-53cbbbba6f08' as UserId,
    email: 'user@example.com' as Email,
    title: 'string',
    firstname: 'string',
    lastname: 'string',
    displayName: 'string',
    avatarUrl: 'string',
  },
  updated: '2022-04-06T13:57:38.793602Z' as DateTime,
  updatedBy: {
    id: '497f6eca-6276-4993-bfeb-53cbbbba6f08' as UserId,
    email: 'user@example.com' as Email,
    title: 'string',
    firstname: 'string',
    lastname: 'string',
    displayName: 'string',
    avatarUrl: 'string',
  },
  room: '2fa2a266-7d97-4147-8f17-1e57105c70ea',
  active: true,
  expiration: '2022-04-06T13:57:38.793602Z' as DateTime,
};

export const mockedPermanentRoomInvite: RoomInvite = {
  ...mockedExpiringDateRoomInvite,
  expiration: null,
};

export const mockedRecurringEvent: RecurringEvent = {
  id: 'db61b29b-b944-422d-b20f-6ed4158aad4d' as EventId,
  createdBy: {
    id: '7224df0f-7051-42ff-9bc9-b8c5a8b39bdb' as UserId,
    email: 't1@testing.opentalk.eu' as Email,
    title: '',
    firstname: 'Test1',
    lastname: 'T1',
    displayName: 'New',
    avatarUrl: 'https://seccdn.libravatar.org/avatar/99a8042a26cef654898731e93d003349',
  },
  createdAt: '2024-03-04T14:10:12.944521Z' as DateTime,
  updatedBy: {
    id: '7224df0f-7051-42ff-9bc9-b8c5a8b39bdb' as UserId,
    email: 't1@testing.opentalk.eu' as Email,
    title: '',
    firstname: 'Test1',
    lastname: 'T1',
    displayName: 'New',
    avatarUrl: 'https://seccdn.libravatar.org/avatar/99a8042a26cef654898731e93d003349',
  },
  updatedAt: '2024-03-04T14:10:12.944521Z' as DateTime,
  title: 'Recurring Meeting',
  description: 'Recurring Meeting for test data',
  room: {
    id: '47cc8df7-b48e-4a56-87f8-92164613f74c' as RoomId,
    waitingRoom: false,
    e2eEncryption: false,
    callIn: {
      tel: '+49 30 - 577 10 231 9901',
      id: '4082652646' as SipId,
      password: '0513013745',
    },
  },
  inviteesTruncated: true,
  invitees: [],
  isTimeIndependent: false,
  isAllDay: false,
  startsAt: {
    datetime: '2024-03-04T18:30:00Z',
    timezone: 'Europe/Berlin',
  },
  endsAt: {
    datetime: '2024-03-04T19:00:00Z',
    timezone: 'Europe/Berlin',
  },
  recurrencePattern: ['RRULE:FREQ=DAILY'] as Array<RecurrencePattern>,
  isAdhoc: false,
  type: EventType.Recurring,
  inviteStatus: InviteStatus.Accepted,
  isFavorite: false,
};
export const mockedSingleEvent: SingleEvent = {
  id: 'c08743df-6de1-4446-95e3-f158ebd81fa0' as EventId,
  createdBy: {
    id: '7224df0f-7051-42ff-9bc9-b8c5a8b39bdb' as UserId,
    email: 't1@testing.opentalk.eu' as Email,
    title: '',
    firstname: 'Test1',
    lastname: 'T1',
    displayName: 'New',
    avatarUrl: 'https://seccdn.libravatar.org/avatar/99a8042a26cef654898731e93d003349',
  },
  createdAt: '2024-03-04T14:30:21.438203Z' as DateTime,
  updatedBy: {
    id: '7224df0f-7051-42ff-9bc9-b8c5a8b39bdb' as UserId,
    email: 't1@testing.opentalk.eu' as Email,
    title: '',
    firstname: 'Test1',
    lastname: 'T1',
    displayName: 'New',
    avatarUrl: 'https://seccdn.libravatar.org/avatar/99a8042a26cef654898731e93d003349',
  },
  updatedAt: '2024-03-04T14:30:21.438203Z' as DateTime,
  title: 'Single Meeting',
  description: 'Single meeting for test data',
  room: {
    id: '2f60df9e-c34e-4cfd-9dc9-e7ebb297583b' as RoomId,
    waitingRoom: false,
    e2eEncryption: false,
    callIn: {
      tel: '+49 30 - 577 10 231 9901',
      id: '0940955973' as SipId,
      password: '2320845822',
    },
  },
  inviteesTruncated: true,
  invitees: [],
  isTimeIndependent: false,
  isAllDay: false,
  startsAt: {
    datetime: '2024-03-04T15:00:00Z',
    timezone: 'Europe/Berlin',
  },
  endsAt: {
    datetime: '2024-03-04T15:30:00Z',
    timezone: 'Europe/Berlin',
  },
  recurrencePattern: [],
  isAdhoc: false,
  type: EventType.Single,
  inviteStatus: InviteStatus.Accepted,
  isFavorite: false,
};

export const mockedRoomAssets: Array<BaseAsset> = [
  {
    id: '5091eba6-f5e2-48dc-b44b-3e6b690339eb' as AssetId,
    filename: 'recording.mkv',
    namespace: 'recording',
    createdAt: '2024-04-24T09:34:29.108740Z' as DateTime,
    kind: 'recording-render',
    size: 4297704,
  },
  {
    id: 'bde00435-61c0-4b8d-8889-ce0688000c9f' as AssetId,
    filename: 'vote_protocol_2023-04-12_11-18-02-UTC.pdf',
    namespace: 'legal_vote',
    createdAt: '2023-04-12T11:18:03.207053Z' as DateTime,
    kind: 'protocol_pdf',
    size: 500000,
  },
  {
    id: '988d6b02-6920-482a-9d99-edbba918b3c4' as AssetId,
    filename: 'vote_protocol_2023-04-19_13-53-24-UTC.pdf',
    namespace: 'legal_vote',
    createdAt: '2023-04-19T13:53:25.326494Z' as DateTime,
    kind: 'protocol_pdf',
    size: 0,
  },
];

type MockSubscriberState = {
  descriptor: string;
  participantId: ParticipantId;
  audioOn: boolean;
  videoOn: boolean;
};

export const mockSubscriberState = ({ descriptor, participantId, videoOn, audioOn }: MockSubscriberState) => ({
  ids: [descriptor],
  entities: {
    [descriptor]: {
      participantId,
      mediaType: Track.Source.Camera,
      audio: audioOn,
      video: videoOn,
      subscriberState: {
        videoRunning: videoOn,
        audioRunning: audioOn,
        connection: 'connected',
      },
      limit: 2,
    },
  },
});

export const mockPoll: Poll = {
  id: 'fake-poll-id' as PollId,
  choices: [],
  duration: 60,
  live: false,
  multipleChoice: false,
  results: [],
  startTime: new Date().toString(),
  state: 'active',
  topic: 'Fake poll',
  voted: false,
};

export const mockLegalVote: LegalVote = {
  id: 'fake-poll-id' as LegalVoteId,
  duration: 60,
  startTime: new Date().toString(),
  state: LegalVoteState.Started,
  topic: 'This is a legal vote fake description',
  votes: {
    yes: 0,
    no: 0,
    abstain: 0,
  },
  allowedParticipants: ['8342a2bf-b63e-422f-9fb8-7409ef997606' as ParticipantId],
  autoClose: false,
  createPdf: false,
  enableAbstain: true,
  kind: LegalVoteKind.RollCall,
  name: 'Fake legal vote',
  initiatorId: 'asd' as ParticipantId,
  maxVotes: 0,
};

export const mockedStreamingTarget: StreamingTarget = {
  name: 'Custom Streaming Platform',
  kind: PlatformKind.Custom,
  streamingKey: '123',
  publicUrl: '123',
  streamingEndpoint: new URL('https://example.com'),
};

export const mockedMeetingFormValues: MeetingFormValues = {
  title: 'Test Meeting',
  description: 'Description',
  waitingRoom: true,
  showMeetingDetails: false,
  password: 'secret',
  isTimeDependent: true,
  startDate: '2025-06-05T10:00:00Z',
  endDate: '2025-06-05T11:00:00Z',
  isAdhoc: false,
  sharedFolder: true,
  streaming: { enabled: false, streamingTarget: undefined },
  e2eEncryption: true,
  trainingParticipationReport: { enabled: false, parameter: undefined },
  recurrencePattern: CommonFrequencies.NONE,
};
