// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../utils/testUtils';
import JoinMeetingDialog from './JoinMeetingDialog';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const ROOM_ID = '30034152-6216-4d46-942d-465dc5918595';
const INVITE_CODE = '22adb8b2-d93a-403d-b6b1-b90eb5db4afe';
const BREAKOUT_ROOM_ID = 'b1a2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d';

const openDialog = async () => {
  const openButton = screen.getByRole('button', { name: /dashboard-join-meeting-button/i });
  await userEvent.click(openButton);
};

const pasteIntoInput = (value: string) => {
  const input = screen.getByLabelText('dashboard-join-meeting-dialog-label');
  fireEvent.paste(input, { clipboardData: { getData: () => value } });
};

const submitDialog = async () => {
  const joinButton = screen.getByRole('button', { name: 'dashboard-join-meeting-dialog-join-button' });
  await userEvent.click(joinButton);
};

describe('JoinMeetingDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens the dialog when the open button is clicked', async () => {
    renderWithProviders(<JoinMeetingDialog />, { provider: { mui: true } });

    await openDialog();

    expect(screen.getByLabelText('dashboard-join-meeting-dialog-label')).toBeInTheDocument();
  });

  it('drops the invite code from a room URL that contains an invite query parameter', async () => {
    renderWithProviders(<JoinMeetingDialog />, { provider: { mui: true } });

    await openDialog();
    pasteIntoInput(`https://testing.opentalk.eu/room/${ROOM_ID}?invite=${INVITE_CODE}`);
    await submitDialog();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledExactlyOnceWith(`/room/${ROOM_ID}`);
    });
  });

  it('navigates to the room path for a plain room URL', async () => {
    renderWithProviders(<JoinMeetingDialog />, { provider: { mui: true } });

    await openDialog();
    pasteIntoInput(`https://testing.opentalk.eu/room/${ROOM_ID}`);
    await submitDialog();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledExactlyOnceWith(`/room/${ROOM_ID}`);
    });
  });

  it('redirects an old invite URL to the verify page', async () => {
    renderWithProviders(<JoinMeetingDialog />, { provider: { mui: true } });

    await openDialog();
    pasteIntoInput(`https://testing.opentalk.eu/invite/${INVITE_CODE}`);
    await submitDialog();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledExactlyOnceWith(`/invite/${INVITE_CODE}`);
    });
  });

  it('navigates to the room path when a bare room id is pasted', async () => {
    renderWithProviders(<JoinMeetingDialog />, { provider: { mui: true } });

    await openDialog();
    pasteIntoInput(ROOM_ID);
    await submitDialog();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledExactlyOnceWith(`/room/${ROOM_ID}`);
    });
  });

  // Legacy links kept working by the router include a trailing breakout-room-id segment (see config/routes.tsx).
  it('navigates to the room path for a legacy room URL with a trailing breakout room id segment', async () => {
    renderWithProviders(<JoinMeetingDialog />, { provider: { mui: true } });

    await openDialog();
    pasteIntoInput(`https://testing.opentalk.eu/room/${ROOM_ID}/${BREAKOUT_ROOM_ID}`);
    await submitDialog();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledExactlyOnceWith(`/room/${ROOM_ID}`);
    });
  });

  // A room URL whose path also contains '/invite/' must be treated as a room link, not an invite link.
  it('navigates to the room path for a room URL whose path contains an invite segment', async () => {
    renderWithProviders(<JoinMeetingDialog />, { provider: { mui: true } });

    await openDialog();
    pasteIntoInput(`https://testing.opentalk.eu/room/${ROOM_ID}/invite/${INVITE_CODE}`);
    await submitDialog();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledExactlyOnceWith(`/room/${ROOM_ID}`);
    });
  });

  describe.each([
    ['a URL without a room or invite path', 'https://testing.opentalk.eu/not-a-room'],
    ['a room URL with a non-UUID room id', 'https://testing.opentalk.eu/room/not-a-uuid'],
    ['an invite URL with a non-UUID invite code', 'https://testing.opentalk.eu/invite/not-a-uuid'],
    ['a string that is not a URL', 'this is not a url'],
  ])('with %s', (_description, invalidValue) => {
    it('shows the invalid URL error and does not navigate', async () => {
      renderWithProviders(<JoinMeetingDialog />, { provider: { mui: true } });

      await openDialog();
      pasteIntoInput(invalidValue);

      expect(await screen.findByText(/dashboard-join-meeting-dialog-invalid-url/)).toBeInTheDocument();

      const input = screen.getByLabelText('dashboard-join-meeting-dialog-label');
      expect(input).toHaveAttribute('aria-invalid', 'true');

      await submitDialog();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
