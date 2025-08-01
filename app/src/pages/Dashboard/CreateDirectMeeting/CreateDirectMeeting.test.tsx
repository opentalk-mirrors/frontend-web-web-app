// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import {
  configureStore,
  eventMockedData,
  mockedPermanentRoomInvite,
  renderWithProviders,
} from '../../../utils/testUtils';
import CreateDirectMeeting from './CreateDirectMeeting';

const mockCreateEvent = () => ({
  unwrap: vi.fn().mockResolvedValue(createMockEvent()),
});
const mockCreateEventInvite = vi.fn();
const mockCreateRoomInvite = () => ({
  unwrap: vi.fn().mockResolvedValue(createMockedPermanentRoomInvites()),
});
const mockCreateSipConfig = vi.fn();
const mockCreateStreamingTarget = vi.fn();

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
  useGetMeTariffQuery: () => [
    mockCreateEvent,
    {
      data: {
        quotas: {
          roomParticipantLimit: 4,
        },
      },
    },
  ],
  useGetStreamingTargetsQuery: () => [mockCreateStreamingTarget],
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
    renderWithProviders(<CreateDirectMeeting />, { store, provider: { router: true, snackbar: true } });

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
    renderWithProviders(<CreateDirectMeeting />, { store, provider: { router: true, snackbar: true } });

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
    expect(mockWriteText).toHaveBeenCalledWith(INVITE_LINK);
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
    expect(mockWriteText).toHaveBeenCalledWith(INVITE_GUEST_LINK);
  });
});
