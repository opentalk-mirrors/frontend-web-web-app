// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { EventId, EventInfo, MeetingDetails, RoomId } from '@opentalk/rest-api-rtk-query';
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
  passwordRequired: false,
};

const meetingDetails: MeetingDetails = {
  streamingLinks: [],
};

const mockRoomInfo: RoomInfo = {
  id: '1' as RoomId,
  password: 'password',
  alias: 'my-personal-room',
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

  it('renders personal room link text field when alias exists', () => {
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

    const personalRoomLinkField = screen.getByRole('textbox', {
      name: 'meeting-details-dialog-label-personal-room-link',
    });
    expect(personalRoomLinkField).toBeInTheDocument();
    expect(personalRoomLinkField).toHaveValue('http://localhost:3000/room/my-personal-room');
  });

  it('does not render personal room link text field when alias is missing', () => {
    renderWithProviders(
      <MeetingDetailsDialog
        open={true}
        onClose={vi.fn()}
        eventInfo={mockEventInfo}
        meetingDetails={meetingDetails}
        roomInfo={{ ...mockRoomInfo, alias: undefined }}
      />,
      { store }
    );

    expect(
      screen.queryByRole('textbox', { name: 'meeting-details-dialog-label-personal-room-link' })
    ).not.toBeInTheDocument();
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

  it('renders meeting link label', () => {
    renderWithProviders(
      <MeetingDetailsDialog
        open={true}
        onClose={vi.fn()}
        eventInfo={mockEventInfo}
        meetingDetails={{ ...meetingDetails }}
        roomInfo={mockRoomInfo}
      />,
      { store, provider: { snackbar: true, mui: true } }
    );
    expect(screen.getByRole('textbox', { name: 'meeting-details-dialog-label-meeting-link' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'meeting-details-dialog-label-invite-link' })).not.toBeInTheDocument();
  });

  it('shows the meeting link copy notification even when an invite code is provided', async () => {
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

    fireEvent.click(screen.getByRole('button', { name: 'meeting-details-dialog-aria-label-meeting-link' }));

    expect(writeText).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(success).toHaveBeenCalledExactlyOnceWith('meeting-details-dialog-copy-meeting-link-success')
    );
  });

  it('shows the meeting link copy notification when copying', async () => {
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    const success = vi.spyOn(notifications, 'success');

    renderWithProviders(
      <MeetingDetailsDialog
        open={true}
        onClose={vi.fn()}
        eventInfo={mockEventInfo}
        meetingDetails={{ ...meetingDetails }}
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

  describe('dial-in field', () => {
    const meetingDetailsWithCallIn: MeetingDetails = {
      streamingLinks: [],
      callIn: {
        id: '1234' as NonNullable<MeetingDetails['callIn']>['id'],
        tel: '+49123456789',
        password: '5678',
      },
    };

    it('renders the dial-in field with its value when high security is disabled', () => {
      const { store } = configureStore({
        initialState: {
          config: {
            baseUrl: 'http://localhost:3000',
            enabledModules: { [BackendModules.Core]: [CoreFeatures.GuestsAllowed] },
          },
          room: { eventInfo: { e2eEncryption: false } },
        },
      });

      renderWithProviders(
        <MeetingDetailsDialog
          open={true}
          onClose={vi.fn()}
          eventInfo={mockEventInfo}
          meetingDetails={meetingDetailsWithCallIn}
          roomInfo={mockRoomInfo}
        />,
        { store, provider: { snackbar: true, mui: true } }
      );

      const sipField = screen.getByRole('textbox', { name: 'meeting-details-dialog-label-sip-link' });
      expect(sipField).toHaveValue('+49123456789,,1234,,5678');
      expect(sipField).not.toBeDisabled();
      expect(screen.getByRole('button', { name: 'meeting-details-dialog-aria-label-sip-link' })).toBeEnabled();
    });

    it('empties and disables the dial-in field and its copy button when high security is enabled', () => {
      const { store } = configureStore({
        initialState: {
          config: {
            baseUrl: 'http://localhost:3000',
            enabledModules: { [BackendModules.Core]: [CoreFeatures.GuestsAllowed] },
          },
          room: { eventInfo: { e2eEncryption: true } },
        },
      });

      renderWithProviders(
        <MeetingDetailsDialog
          open={true}
          onClose={vi.fn()}
          eventInfo={{ ...mockEventInfo, e2eEncryption: true }}
          meetingDetails={meetingDetailsWithCallIn}
          roomInfo={mockRoomInfo}
        />,
        { store, provider: { snackbar: true, mui: true } }
      );

      const sipField = screen.getByRole('textbox', { name: 'meeting-details-dialog-label-sip-link' });
      expect(sipField).not.toHaveValue('+49123456789,,1234,,5678');
      expect(sipField).toBeDisabled();
      expect(screen.getByRole('button', { name: 'meeting-details-dialog-aria-label-sip-link' })).toBeDisabled();
    });
  });
});
