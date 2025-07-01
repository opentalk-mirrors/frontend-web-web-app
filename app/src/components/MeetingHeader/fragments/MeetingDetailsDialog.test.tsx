// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { EventId, EventInfo, InviteCode, RoomId } from '@opentalk/rest-api-rtk-query';
import { fireEvent, screen } from '@testing-library/react';

import type { RoomInfo } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import MeetingDetailsDialog from './MeetingDetailsDialog';

const mockEventInfo: EventInfo = {
  id: '1' as EventId,
  title: 'Test Meeting',
  isAdhoc: false,
  meetingDetails: {
    inviteCodeId: '12345' as InviteCode,
    streamingLinks: [],
  },
  roomId: '1' as RoomId,
  e2eEncryption: false,
};

const mockRoomInfo: RoomInfo = {
  id: '1' as RoomId,
  password: 'password',
  createdBy: {
    title: 'Mr.',
    firstname: 'John',
    lastname: 'Doe',
    displayName: 'John Doe',
    avatar_url: 'https://example.com/avatar.jpg',
  },
};

jest.mock('../../../commonComponents', () => ({
  ...jest.requireActual('../../../commonComponents'),
  notifications: {
    success: jest.fn(),
  },
}));

const { store } = configureStore({
  initialState: {},
});

describe('MeetingDetailsDialog', () => {
  let clipboardWriteTextOriginal: Clipboard['writeText'];

  beforeEach(() => {
    clipboardWriteTextOriginal = navigator.clipboard?.writeText?.bind(navigator.clipboard);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: clipboardWriteTextOriginal,
      },
    });
  });

  it('should render without crashing', () => {
    expect(() =>
      renderWithProviders(
        <MeetingDetailsDialog open={true} onClose={jest.fn()} eventInfo={mockEventInfo} roomInfo={mockRoomInfo} />,
        { store }
      )
    ).not.toThrow();
  });

  it('renders room password when provided.', () => {
    const { unmount } = renderWithProviders(
      <MeetingDetailsDialog open={true} onClose={jest.fn()} eventInfo={mockEventInfo} roomInfo={mockRoomInfo} />,
      { store }
    );
    expect(screen.getByLabelText('meeting-details-dialog-label-room-password')).toBeInTheDocument();
    unmount();
    renderWithProviders(
      <MeetingDetailsDialog
        open={true}
        onClose={jest.fn()}
        eventInfo={mockEventInfo}
        roomInfo={{ ...mockRoomInfo, password: '' }}
      />,
      { store }
    );
    expect(screen.queryByLabelText('meeting-details-dialog-label-room-password')).not.toBeInTheDocument();
  });

  it("writes content to the clipboard when 'Copy' button is clicked", () => {
    (navigator.clipboard.writeText as jest.Mock).mockResolvedValueOnce(undefined);

    renderWithProviders(
      <MeetingDetailsDialog open={true} onClose={jest.fn()} eventInfo={mockEventInfo} roomInfo={mockRoomInfo} />,
      { store }
    );

    const copyButton = screen.getByText('meeting-details-dialog-copy-button');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
