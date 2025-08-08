// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { EventId, EventInfo, InviteCode, RoomId } from '@opentalk/rest-api-rtk-query';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Mock } from 'vitest';

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

const { store } = configureStore({
  initialState: {},
});

describe('MeetingDetailsDialog', () => {
  let clipboardWriteTextOriginal: Clipboard['writeText'];

  beforeEach(() => {
    clipboardWriteTextOriginal = navigator.clipboard?.writeText?.bind(navigator.clipboard);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn(),
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

  it('should render without crashing', async () => {
    renderWithProviders(
      <MeetingDetailsDialog open={true} onClose={vi.fn()} eventInfo={mockEventInfo} roomInfo={mockRoomInfo} />,
      { store }
    );

    expect(await screen.findByText('meeting-details-dialog-title')).toBeInTheDocument();
  });

  it('renders room password when provided.', async () => {
    const { unmount } = renderWithProviders(
      <MeetingDetailsDialog open={true} onClose={vi.fn()} eventInfo={mockEventInfo} roomInfo={mockRoomInfo} />,
      { store }
    );
    expect(await screen.findByLabelText('meeting-details-dialog-label-room-password')).toBeInTheDocument();
    unmount();
    renderWithProviders(
      <MeetingDetailsDialog
        open={true}
        onClose={vi.fn()}
        eventInfo={mockEventInfo}
        roomInfo={{ ...mockRoomInfo, password: '' }}
      />,
      { store }
    );
    expect(await screen.findByText('meeting-details-dialog-title')).toBeInTheDocument();
    expect(screen.queryByLabelText('meeting-details-dialog-label-room-password')).not.toBeInTheDocument();
  });

  it("writes content to the clipboard when 'Copy' button is clicked", async () => {
    (navigator.clipboard.writeText as Mock).mockResolvedValueOnce(undefined);

    renderWithProviders(
      <MeetingDetailsDialog open={true} onClose={vi.fn()} eventInfo={mockEventInfo} roomInfo={mockRoomInfo} />,
      { store, provider: { snackbar: true, mui: true } }
    );

    const copyButton = await screen.findByText('meeting-details-dialog-copy-button');
    await userEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
