// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { GuestAccess, RoomId } from '@opentalk/rest-api-rtk-query';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import {
  configureStore,
  eventMockedData,
  mockedPermanentRoomInvite,
  renderWithProviders,
} from '../../../utils/testUtils';
import CreateDirectMeeting from './CreateDirectMeeting';

const mockUnwrap = vi.fn(() => Promise.resolve(createMockEvent()));
const mockCreateEvent = vi.fn(() => ({
  unwrap: mockUnwrap,
}));
const mockCreateEventInvite = vi.fn();
const mockCreateRoomInvite = () => ({
  unwrap: vi.fn().mockResolvedValue(createMockedPermanentRoomInvites()),
});
const mockCreateSipConfig = vi.fn();
const mockCreateStreamingTarget = vi.fn();

let mockMeTariff: { quotas: Record<string, number>; modules: Record<string, { features: string[] }> };

const ROOM_ID = 'ROOM_ID' as RoomId;
const MOCK_INVITE_CODE = 'MOCK_INVITE_CODE';
const INVITE_LINK = `${window.location.origin}/room/${ROOM_ID}`;
const INVITE_GUEST_LINK = `${window.location.origin}/room/${ROOM_ID}?invite=${MOCK_INVITE_CODE}`;

const createMockEvent = () => ({
  ...eventMockedData,
  room: {
    id: ROOM_ID,
  },
});

const createMockedPermanentRoomInvites = () => [
  {
    ...mockedPermanentRoomInvite,
    inviteCode: MOCK_INVITE_CODE,
  },
];

vi.mock('../../../api/rest', async (importOriginal) => ({
  ...(await importOriginal()),
  useCreateEventMutation: () => [
    mockCreateEvent,
    {
      data: createMockEvent(),
      isLoading: false,
    },
  ],
  useCreateEventInviteMutation: () => [
    mockCreateEventInvite,
    {
      isLoading: false,
      isSuccess: true,
      status: 'uninitialized',
    },
  ],
  useUpdateRoomSipConfigMutation: () => [
    mockCreateSipConfig,
    {
      data: {},
      isLoading: false,
    },
  ],
  useGetRoomInvitesQuery: () => ({
    data: [
      {
        inviteCode: MOCK_INVITE_CODE,
        expiration: null,
        active: true,
      },
    ],
    isLoading: false,
    isFetching: false,
  }),
  useGetMeQuery: () => ({
    data: {
      displayName: 'Test',
    },
  }),
  useCreateRoomInviteMutation: () => [
    mockCreateRoomInvite,
    {
      isLoading: false,
      isSuccess: true,
      status: 'uninitialized',
    },
  ],
  useGetMeTariffQuery: () => ({
    data: mockMeTariff,
  }),
  useGetStreamingTargetsQuery: () => [mockCreateStreamingTarget],
  useGetRoomTariffQuery: () => ({
    data: {
      modules: {
        core: {
          features: ['guests_allowed'],
        },
      },
    },
  }),
}));

vi.mock('../../../components/InvitedParticipants/InvitedParticipants', () => ({
  __esModule: true,
  default: () => {
    return <div />;
  },
}));

vi.mock('../../../components/SelectParticipants/SelectParticipants', () => ({
  __esModule: true,
  default: () => {
    return <div />;
  },
}));

describe('CreateDirectMeeting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMeTariff = {
      quotas: {
        roomParticipantLimit: 4,
      },
      modules: {
        core: {
          features: ['guests_allowed'],
        },
      },
    };
  });

  it('should render without crash', () => {
    const { store } = configureStore({
      initialState: {
        config: {
          baseUrl: 'http://localhost:3000',
          features: {
            userSearch: true,
          },
        },
      },
    });
    renderWithProviders(<CreateDirectMeeting />, { store, provider: { router: true, snackbar: true, mui: true } });

    expect(screen.getByText('dashboard-direct-meeting-title')).toBeInTheDocument();
  });

  it('generates link and fills it into textfield', () => {
    const { store } = configureStore({
      initialState: {
        config: {
          baseUrl: 'http://localhost:3000',
          features: {
            userSearch: true,
          },
        },
      },
    });
    renderWithProviders(<CreateDirectMeeting />, { store, provider: { router: true, snackbar: true, mui: true } });

    expect(screen.getByDisplayValue(INVITE_LINK)).toBeInTheDocument();
  });

  it('copies the link', async () => {
    const mockWriteText = vi.fn((value) => Promise.resolve(value));
    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      value: {
        writeText: mockWriteText,
      },
    });
    const { store } = configureStore({
      initialState: {
        config: {
          baseUrl: 'http://localhost:3000',
          features: {
            userSearch: true,
          },
        },
      },
    });
    renderWithProviders(<CreateDirectMeeting />, { store, provider: { router: true, snackbar: true, mui: true } });

    const copyButton = screen.getByLabelText('dashboard-invite-to-meeting-copy-room-link-aria-label');
    expect(copyButton).toBeInTheDocument();

    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledTimes(1);
    });
    expect(mockWriteText).toHaveBeenCalledExactlyOnceWith(INVITE_LINK);
  });

  it('copies the guest link, if link exists', async () => {
    const mockWriteText = vi.fn((value) => Promise.resolve(value));
    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      value: {
        writeText: mockWriteText,
      },
    });
    const { store } = configureStore({
      initialState: {
        config: {
          baseUrl: 'http://localhost:3000',
          features: {
            userSearch: true,
          },
        },
      },
    });
    renderWithProviders(<CreateDirectMeeting />, { store, provider: { router: true, snackbar: true, mui: true } });

    const copyButton = screen.getByLabelText('dashboard-invite-to-meeting-copy-guest-link-aria-label');
    expect(copyButton).toBeInTheDocument();

    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledTimes(1);
    });
    expect(mockWriteText).toHaveBeenCalledExactlyOnceWith(INVITE_GUEST_LINK);
  });

  it('creates the meeting with direct guest access when the tariff allows guests', async () => {
    const { store } = configureStore({
      initialState: {
        config: {
          baseUrl: 'http://localhost:3000',
          features: {
            userSearch: true,
          },
        },
      },
    });
    renderWithProviders(<CreateDirectMeeting />, { store, provider: { router: true, snackbar: true, mui: true } });

    await waitFor(() => {
      expect(mockCreateEvent).toHaveBeenCalledWith(expect.objectContaining({ guestAccess: GuestAccess.DirectAccess }));
    });
  });

  it('creates the meeting with guest access disabled when the tariff does not allow guests', async () => {
    mockMeTariff = { quotas: { roomParticipantLimit: 4 }, modules: { core: { features: [] } } };
    const { store } = configureStore({
      initialState: {
        config: {
          baseUrl: 'http://localhost:3000',
          features: {
            userSearch: true,
          },
        },
      },
    });
    renderWithProviders(<CreateDirectMeeting />, { store, provider: { router: true, snackbar: true, mui: true } });

    await waitFor(() => {
      expect(mockCreateEvent).toHaveBeenCalledWith(expect.objectContaining({ guestAccess: GuestAccess.Disabled }));
    });
  });
});
