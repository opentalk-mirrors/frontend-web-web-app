// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { screen, cleanup, waitFor } from '@testing-library/react';

import { createStore, eventMockedData, mockedPermanentRoomInvite, renderWithProviders } from '../../../utils/testUtils';
import CreateDirectMeeting from './CreateDirectMeeting';

const mockCreateEvent = () => ({
  unwrap: jest.fn().mockResolvedValue(createMockEvent()),
});
const mockCreateEventInvite = jest.fn();
const mockCreateRoomInvite = () => ({
  unwrap: jest.fn().mockResolvedValue(createMockedPermanentRoomInvites()),
});
const mockCreateSipConfig = jest.fn();
const mockCreateStreamingTarget = jest.fn();

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

jest.mock('../../../api/rest', () => ({
  ...jest.requireActual('../../../api/rest'),
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

jest.mock('../../../components/InvitedParticipants/InvitedParticipants', () => ({
  __esModule: true,
  default: () => {
    return <div />;
  },
}));

jest.mock('../../../components/SelectParticipants/SelectParticipants', () => ({
  __esModule: true,
  default: () => {
    return <div />;
  },
}));

describe('Dashboard CreateDirectMeeting', () => {
  afterEach(() => cleanup());

  test('page will not crash', () => {
    const { store } = createStore();
    renderWithProviders(<CreateDirectMeeting />, { store, provider: { router: true, snackbar: true } });

    expect(screen.getByText('dashboard-direct-meeting-title')).toBeInTheDocument();
  });

  test('link will be generated and filled into textfield', () => {
    const { store } = createStore();
    renderWithProviders(<CreateDirectMeeting />, { store, provider: { router: true, snackbar: true } });

    expect(screen.getByDisplayValue(INVITE_LINK)).toBeInTheDocument();
  });

  test('click on copy icon will copy the link', async () => {
    const mockWriteText = jest.fn((value) => Promise.resolve(value));
    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      value: {
        writeText: mockWriteText,
      },
    });
    const { store } = createStore();
    renderWithProviders(<CreateDirectMeeting />, { store, provider: { router: true, snackbar: true, mui: true } });

    const copyButton = screen.getByLabelText('dashboard-invite-to-meeting-copy-room-link-aria-label');
    expect(copyButton).toBeInTheDocument();

    copyButton.click();

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledTimes(1);
      expect(mockWriteText).toHaveBeenCalledWith(INVITE_LINK);
    });
  });

  test('click on copy guest invite icon will copy the guest link, if link exists', async () => {
    const mockWriteText = jest.fn((value) => Promise.resolve(value));
    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      value: {
        writeText: mockWriteText,
      },
    });
    const { store } = createStore();
    renderWithProviders(<CreateDirectMeeting />, { store, provider: { router: true, snackbar: true, mui: true } });

    const copyButton = screen.getByLabelText('dashboard-invite-to-meeting-copy-guest-link-aria-label');
    expect(copyButton).toBeInTheDocument();

    copyButton.click();

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledTimes(1);
      expect(mockWriteText).toHaveBeenCalledWith(INVITE_GUEST_LINK);
    });
  });
});
