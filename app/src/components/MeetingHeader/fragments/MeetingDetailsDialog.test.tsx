// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { EventId, EventInfo, InviteCode, RoomId } from '@opentalk/rest-api-rtk-query';
import { screen } from '@testing-library/react';

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

vi.mock('./MeetingDetailsDialogActions', () => ({
  __esModule: true,
  default: () => {
    return <div data-testid="meeting-details-dialog-actions"></div>;
  },
}));

describe('MeetingDetailsDialog', () => {
  const { store } = configureStore({
    initialState: {
      config: {
        baseUrl: 'http://localhost:3000',
        tariff: {
          modules: {
            core: {
              features: ['guests_allowed'],
            },
          },
        },
      },
    },
  });

  it('renders dialog and it"s main components', () => {
    renderWithProviders(
      <MeetingDetailsDialog open={true} onClose={vi.fn()} eventInfo={mockEventInfo} roomInfo={mockRoomInfo} />,
      { store }
    );

    expect(screen.getByRole('dialog', { name: 'meeting-details-dialog-title' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'global-close-dialog' })).toBeInTheDocument();
    expect(screen.getByTestId('meeting-details-dialog-actions')).toBeInTheDocument();
  });

  it('renders room password text field when password provided', () => {
    renderWithProviders(
      <MeetingDetailsDialog open={true} onClose={vi.fn()} eventInfo={mockEventInfo} roomInfo={mockRoomInfo} />,
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
        roomInfo={{ ...mockRoomInfo, password: '' }}
      />,
      { store }
    );
    expect(screen.queryByLabelText('meeting-details-dialog-label-room-password')).not.toBeInTheDocument();
  });

  it('renders invite link when guests allowed feature is enabled', () => {
    renderWithProviders(
      <MeetingDetailsDialog open={true} onClose={vi.fn()} eventInfo={mockEventInfo} roomInfo={mockRoomInfo} />,
      { store, provider: { snackbar: true, mui: true } }
    );
    expect(screen.getByRole('textbox', { name: 'meeting-details-dialog-label-invite-link' })).toBeInTheDocument();
  });

  it('does not render invite link when guests allowed feature is disabled', () => {
    const { store: storeWithGuestsNotAllowed } = configureStore({
      initialState: {
        config: {
          baseUrl: 'http://localhost:3000',
          tariff: {
            modules: {
              core: {
                features: [],
              },
            },
          },
        },
      },
    });
    renderWithProviders(
      <MeetingDetailsDialog
        open={true}
        onClose={vi.fn()}
        eventInfo={mockEventInfo}
        roomInfo={{ ...mockRoomInfo, password: '' }}
      />,
      { store: storeWithGuestsNotAllowed }
    );
    expect(screen.queryByRole('textbox', { name: 'meeting-details-dialog-label-invite-link' })).not.toBeInTheDocument();
  });
});
