// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { UserId, RoomId, RoomInvite } from '@opentalk/rest-api-rtk-query';
import { render, screen } from '@testing-library/react';
import { Mock } from 'vitest';

import { useGetRoomInvitesQuery } from '../../../api/rest';
import { mockedPermanentRoomInvite } from '../../../utils/testUtils';
import GuestLinkField from './GuestLinkField';
import type { MeetingLinkFieldProps } from './MeetingLinkField';
import { FieldKeys } from './constants';

vi.mock('./MeetingLinkField', () => ({
  __esModule: true,
  default: (props: MeetingLinkFieldProps) => {
    const { value, isLoading } = props;
    return (
      <div data-testid="meeting-link-field">
        <span>{value ? value?.toString() : 'No link'}</span>
        {isLoading && <span>Loading</span>}
      </div>
    );
  },
}));

const MOCK_INVITE_URL = 'http://localhost:3000/invite';
vi.mock('../../../utils/apiUtils', async (importOriginal) => ({
  ...(await importOriginal()),
  composeInviteUrl: () => MOCK_INVITE_URL,
}));

const USER_ID = '12345' as UserId;
const mockRoomId = '67890' as RoomId;
const mockBaseURL = 'http://localhost:3000';
const mockMeetingLinkFieldProps: MeetingLinkFieldProps = {
  fieldKey: FieldKeys.GuestLink,
  checked: false,
  setHighlightedField: vi.fn(),
  tooltip: 'Guest Link Tooltip',
};

const mockCreateRoomInvite = vi.fn();
const mockGetRoomInvites = useGetRoomInvitesQuery as Mock;
vi.mock('../../../api/rest', async (importOriginal) => ({
  ...(await importOriginal()),
  useGetMeQuery: () => ({
    data: {
      id: USER_ID,
    },
  }),
  useCreateRoomInviteMutation: () => [mockCreateRoomInvite],
  useGetRoomInvitesQuery: vi.fn().mockImplementation(() => mockGetRoomInvites),
}));

describe('GuestLinkField', () => {
  const renderComponent = (creatorId = USER_ID) => {
    render(
      <GuestLinkField
        eventCreatorId={creatorId}
        roomId={mockRoomId}
        baseURL={mockBaseURL}
        {...mockMeetingLinkFieldProps}
      />
    );
  };

  const setupGetRoomInvitesMock = ({
    data = [],
    isLoading = false,
    isFetching = false,
  }: {
    data?: RoomInvite[];
    isLoading?: boolean;
    isFetching?: boolean;
  }) => {
    mockGetRoomInvites.mockReturnValue({
      data,
      isLoading,
      isFetching,
    });
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering of the meeting link field', () => {
    it('renders the meeting link field', () => {
      setupGetRoomInvitesMock({});
      renderComponent();
      expect(screen.getByTestId('meeting-link-field')).toBeInTheDocument();
    });

    describe('loading state', () => {
      it('does not pass loading state if events are not being loaded or fetched', () => {
        setupGetRoomInvitesMock({});
        renderComponent();
        expect(screen.queryByText('Loading')).not.toBeInTheDocument();
      });
      it('passes the loading state if events are being loaded', () => {
        setupGetRoomInvitesMock({ isLoading: true });
        renderComponent();
        expect(screen.getByText('Loading')).toBeInTheDocument();
      });
      it('passes the loading state if events are being fetched', () => {
        setupGetRoomInvitesMock({ isFetching: true });
        renderComponent();
        expect(screen.getByText('Loading')).toBeInTheDocument();
      });
    });

    describe('link value', () => {
      it('passes undefined value if no link exists', () => {
        setupGetRoomInvitesMock({});
        renderComponent();
        expect(screen.getByText('No link')).toBeInTheDocument();
        expect(screen.queryByText(MOCK_INVITE_URL)).not.toBeInTheDocument();
      });
      it('passes guest link value if it exists', () => {
        setupGetRoomInvitesMock({ data: [mockedPermanentRoomInvite] });
        renderComponent();
        expect(screen.queryByText('No link')).not.toBeInTheDocument();
        expect(screen.getByText(MOCK_INVITE_URL)).toBeInTheDocument();
      });
    });
  });

  describe('permanent invite creation', () => {
    it('requests permanent invite if there is no permanent invite for event and user is the event creator', () => {
      setupGetRoomInvitesMock({});
      renderComponent();
      expect(mockCreateRoomInvite).toHaveBeenCalledExactlyOnceWith({ id: mockRoomId });
    });
    it('does not request permanent invite if there is no permanent invite for event and user is not the event creator', () => {
      setupGetRoomInvitesMock({});
      renderComponent('xxx' as UserId);
      expect(mockCreateRoomInvite).not.toHaveBeenCalled();
    });
    it('does not request permanent invite if there are permanent invites for event', () => {
      setupGetRoomInvitesMock({ data: [mockedPermanentRoomInvite] });
      renderComponent();
      expect(mockCreateRoomInvite).not.toHaveBeenCalled();
    });
    it('does not request permanent invite if invites are being loaded', () => {
      setupGetRoomInvitesMock({ isLoading: true });
      renderComponent();
      expect(mockCreateRoomInvite).not.toHaveBeenCalled();
    });
    it('does not request permanent invite if invites are being fetched', () => {
      setupGetRoomInvitesMock({ isFetching: true });
      renderComponent();
      expect(mockCreateRoomInvite).not.toHaveBeenCalled();
    });
  });
});
