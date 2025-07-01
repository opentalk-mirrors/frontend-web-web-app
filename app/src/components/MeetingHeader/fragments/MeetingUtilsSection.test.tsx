// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useLocalParticipant } from '@livekit/components-react';
import { screen } from '@testing-library/react';
import { ConnectionQuality } from 'livekit-client';

import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import MeetingUtilsSection from './MeetingUtilsSection';

jest.mock('@livekit/components-react', () => ({
  useLocalParticipant: jest.fn(),
}));

jest.mock('../../SecurityBadge/SecurityBadge', () => ({
  __esModule: true,
  default: () => <div>SecurityBadge</div>,
}));

jest.mock('./MeetingTimer', () => ({
  __esModule: true,
  default: () => <div>MeetingTimer</div>,
}));

jest.mock('./WaitingParticipantsPopover', () => ({
  __esModule: true,
  default: () => <div>WaitingParticipantsPopover</div>,
}));

describe('MeetingUtilsSection rendering logic', () => {
  beforeEach(() => {
    (useLocalParticipant as jest.Mock).mockReturnValue({
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
    const { unmount } = renderWithProviders(<MeetingUtilsSection />, { store });
    expect(screen.queryByLabelText('bad-media-connection-button-label')).not.toBeInTheDocument();
    (useLocalParticipant as jest.Mock).mockReturnValue({
      localParticipant: {
        connectionQuality: ConnectionQuality.Poor,
      },
    });
    unmount();
    renderWithProviders(<MeetingUtilsSection />, { store });
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
    renderWithProviders(<MeetingUtilsSection />, { store });
    expect(screen.getByText('WaitingParticipantsPopover')).toBeInTheDocument();
  });

  it('should render security badge when protocol is https', () => {
    const { store } = configureStore();
    Object.defineProperty(window, 'location', {
      value: {
        protocol: 'https:',
      },
    });
    renderWithProviders(<MeetingUtilsSection />, { store });
    expect(screen.getByText('SecurityBadge')).toBeInTheDocument();
  });
});
