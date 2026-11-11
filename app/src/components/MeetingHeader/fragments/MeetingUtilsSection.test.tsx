// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useLocalParticipant } from '@livekit/components-react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectionQuality } from 'livekit-client';
import { Mock } from 'vitest';

import { TranscriptionStatus } from '../../../api/types/incoming/transcription';
import { getLocationProtocol } from '../../../utils/apiUtils';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import MeetingUtilsSection from './MeetingUtilsSection';

vi.mock('@livekit/components-react', () => ({
  useLocalParticipant: vi.fn(),
}));

vi.mock('../../SecurityBadge/SecurityBadge', () => ({
  __esModule: true,
  default: () => <div>SecurityBadge</div>,
}));

vi.mock('./MeetingTimer', () => ({
  __esModule: true,
  default: () => <div>MeetingTimer</div>,
}));

vi.mock('./WaitingParticipantsPopover', () => ({
  __esModule: true,
  default: () => <div>WaitingParticipantsPopover</div>,
}));

vi.mock('../../../utils/apiUtils', () => ({
  getLocationProtocol: vi.fn(),
}));

describe('MeetingUtilsSection rendering logic', () => {
  beforeEach(() => {
    (getLocationProtocol as Mock).mockReturnValue('http:');
    (useLocalParticipant as Mock).mockReturnValue({
      localParticipant: {
        connectionQuality: ConnectionQuality.Good,
      },
    });
  });

  it("should render bad media connection icon when there's a bad connection", () => {
    const { store } = configureStore({
      initialState: {
        user: {
          role: 'user',
        },
      },
    });
    const { unmount } = renderWithProviders(<MeetingUtilsSection />, { store, provider: { mui: true } });
    expect(screen.queryByLabelText('bad-media-connection-button-label')).not.toBeInTheDocument();
    (useLocalParticipant as Mock).mockReturnValue({
      localParticipant: {
        connectionQuality: ConnectionQuality.Poor,
      },
    });
    unmount();
    renderWithProviders(<MeetingUtilsSection />, { store, provider: { mui: true } });
    expect(screen.getByLabelText('bad-media-connection-button-label')).toBeInTheDocument();
  });

  it('should render waiting participants popover for moderators', () => {
    const { store } = configureStore({
      initialState: {
        user: {
          role: 'moderator',
        },
      },
    });
    renderWithProviders(<MeetingUtilsSection />, { store, provider: { mui: true } });
    expect(screen.getByText('WaitingParticipantsPopover')).toBeInTheDocument();
  });

  it('should render security badge for secure connection', () => {
    (getLocationProtocol as Mock).mockReturnValue('https:');
    const { store } = configureStore();
    renderWithProviders(<MeetingUtilsSection />, { store, provider: { mui: true } });
    expect(screen.getByText('SecurityBadge')).toBeInTheDocument();
  });

  it('should not render security badge for insecure connection', () => {
    (getLocationProtocol as Mock).mockReturnValue('http:');
    const { store } = configureStore();
    renderWithProviders(<MeetingUtilsSection />, { store, provider: { mui: true } });
    expect(screen.queryByText('SecurityBadge')).not.toBeInTheDocument();
  });

  it('should render the automatic meeting protocol icon when the automatic meeting protocol is running', () => {
    const { store } = configureStore({
      initialState: {
        transcription: {
          status: TranscriptionStatus.Running,
          liveTranscription: false,
          automaticMeetingProtocol: { pseudonymous: false, paused: false },
        },
      },
    });
    renderWithProviders(<MeetingUtilsSection />, { store, provider: { mui: true } });
    expect(screen.getByLabelText('automatic-meeting-protocol-active')).toBeInTheDocument();
  });

  it('should show a tooltip on the automatic meeting protocol icon', async () => {
    const user = userEvent.setup();
    const { store } = configureStore({
      initialState: {
        transcription: {
          status: TranscriptionStatus.Running,
          liveTranscription: false,
          automaticMeetingProtocol: { pseudonymous: false, paused: false },
        },
      },
    });
    renderWithProviders(<MeetingUtilsSection />, { store, provider: { mui: true } });

    await user.hover(screen.getByLabelText('automatic-meeting-protocol-active'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('automatic-meeting-protocol-active');
  });

  it('should not render the automatic meeting protocol icon when only live transcription is running', () => {
    const { store } = configureStore({
      initialState: {
        transcription: {
          status: TranscriptionStatus.Running,
          liveTranscription: true,
          automaticMeetingProtocol: null,
        },
      },
    });
    renderWithProviders(<MeetingUtilsSection />, { store, provider: { mui: true } });
    expect(screen.queryByLabelText('automatic-meeting-protocol-active')).not.toBeInTheDocument();
  });

  it('should not render the automatic meeting protocol icon while the automatic meeting protocol is only requested', () => {
    const { store } = configureStore({
      initialState: {
        transcription: {
          status: TranscriptionStatus.Requested,
          liveTranscription: false,
          automaticMeetingProtocol: { pseudonymous: false, paused: false },
        },
      },
    });
    renderWithProviders(<MeetingUtilsSection />, { store, provider: { mui: true } });
    expect(screen.queryByLabelText('automatic-meeting-protocol-active')).not.toBeInTheDocument();
  });
});
