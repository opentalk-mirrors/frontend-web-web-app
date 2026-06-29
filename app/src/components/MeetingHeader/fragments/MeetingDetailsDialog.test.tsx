// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { EventId, EventInfo, InviteCode, MeetingDetails, RoomId } from '@opentalk/rest-api-rtk-query';
import { BackendModules, CoreFeatures } from '@opentalk/rest-api-rtk-query';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { notifications } from '../../../commonComponents';
import type { RoomInfo } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import MeetingDetailsDialog from './MeetingDetailsDialog';

const mockEventInfo: EventInfo = {
  id: '1' as EventId,
  title: 'Test Meeting',
  isAdhoc: false,
  roomId: '1' as RoomId,
  e2eEncryption: false,
};

const meetingDetails: MeetingDetails = {
  inviteCodeId: '12345' as InviteCode,
  streamingLinks: [],
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

vi.mock('./MeetingDetailsDialogActions', () => ({
  __esModule: true,
  default: () => {
    return <div data-testid="meeting-details-dialog-actions"></div>;
  },
}));

describe('MeetingDetailsDialog', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const { store } = configureStore({
    initialState: {
      config: {
        baseUrl: 'http://localhost:3000',
        enabledModules: { [BackendModules.Core]: [CoreFeatures.GuestsAllowed] },
      },
    },
  });

  it('renders dialog and it"s main components', () => {
    renderWithProviders(
      <MeetingDetailsDialog
        open={true}
        onClose={vi.fn()}
        eventInfo={mockEventInfo}
        meetingDetails={meetingDetails}
        roomInfo={mockRoomInfo}
      />,
      { store }
    );

    expect(screen.getByRole('dialog', { name: 'meeting-details-dialog-title' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'global-close-dialog' })).toBeInTheDocument();
    expect(screen.getByTestId('meeting-details-dialog-actions')).toBeInTheDocument();
  });

  it('renders room password text field when password provided', () => {
    renderWithProviders(
      <MeetingDetailsDialog
        open={true}
        onClose={vi.fn()}
        eventInfo={mockEventInfo}
        meetingDetails={meetingDetails}
        roomInfo={mockRoomInfo}
      />,
      { store }
    );
    expect(screen.getByRole('textbox', { name: 'meeting-details-dialog-label-room-password' })).toBeInTheDocument();
  });

  it('does not render room password text field when password not provided', () => {
    renderWithProviders(
      <MeetingDetailsDialog
        open={true}
        onClose={vi.fn()}
        eventInfo={mockEventInfo}
        meetingDetails={meetingDetails}
        roomInfo={{ ...mockRoomInfo, password: '' }}
      />,
      { store }
    );
    expect(screen.queryByLabelText('meeting-details-dialog-label-room-password')).not.toBeInTheDocument();
  });

  it('renders invite link label when invite code is provided', () => {
    renderWithProviders(
      <MeetingDetailsDialog
        open={true}
        onClose={vi.fn()}
        eventInfo={mockEventInfo}
        meetingDetails={meetingDetails}
        roomInfo={mockRoomInfo}
      />,
      { store, provider: { snackbar: true, mui: true } }
    );
    expect(screen.getByRole('textbox', { name: 'meeting-details-dialog-label-invite-link' })).toBeInTheDocument();
  });

  it('renders meeting link label when no invite code is provided', () => {
    renderWithProviders(
      <MeetingDetailsDialog
        open={true}
        onClose={vi.fn()}
        eventInfo={mockEventInfo}
        meetingDetails={{ ...meetingDetails, inviteCodeId: undefined }}
        roomInfo={mockRoomInfo}
      />,
      { store, provider: { snackbar: true, mui: true } }
    );
    expect(screen.getByRole('textbox', { name: 'meeting-details-dialog-label-meeting-link' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'meeting-details-dialog-label-invite-link' })).not.toBeInTheDocument();
  });

  it('shows the invite link copy notification when copying with an invite code', async () => {
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    const success = vi.spyOn(notifications, 'success');

    renderWithProviders(
      <MeetingDetailsDialog
        open={true}
        onClose={vi.fn()}
        eventInfo={mockEventInfo}
        meetingDetails={meetingDetails}
        roomInfo={mockRoomInfo}
      />,
      { store, provider: { snackbar: true, mui: true } }
    );

    fireEvent.click(screen.getByRole('button', { name: 'meeting-details-dialog-aria-label-invite-link' }));

    expect(writeText).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(success).toHaveBeenCalledExactlyOnceWith('meeting-details-dialog-copy-invite-link-success')
    );
  });

  it('shows the meeting link copy notification when copying without an invite code', async () => {
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    const success = vi.spyOn(notifications, 'success');

    renderWithProviders(
      <MeetingDetailsDialog
        open={true}
        onClose={vi.fn()}
        eventInfo={mockEventInfo}
        meetingDetails={{ ...meetingDetails, inviteCodeId: undefined }}
        roomInfo={mockRoomInfo}
      />,
      { store, provider: { snackbar: true, mui: true } }
    );

    fireEvent.click(screen.getByRole('button', { name: 'meeting-details-dialog-aria-label-meeting-link' }));

    expect(writeText).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(success).toHaveBeenCalledExactlyOnceWith('meeting-details-dialog-copy-meeting-link-success')
    );
  });
});
