// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import { PropsWithChildren } from 'react';

import type { ParticipantAvatarProps } from '../../commonComponents';
import { renderWithProviders } from '../../utils/testUtils';
import ParticipantVideoFallback from './ParticipantVideoFallback';

vi.mock('../../commonComponents/ParticipantAvatar', () => ({
  __esModule: true,
  default: (props: ParticipantAvatarProps & PropsWithChildren) => (
    <div data-testid="participant-avatar">
      {props.children} {props.isSipParticipant && <div data-testid="sip-participant" />} {props.src}
    </div>
  ),
}));

const DISPLAY_NAME = 'Test Name';

describe('ParticipantVideoFallback', () => {
  it('renders avatar', () => {
    renderWithProviders(<ParticipantVideoFallback />, {
      provider: { mui: true },
    });
    expect(screen.getByTestId('participant-avatar')).toBeInTheDocument();
  });
  it('renders display name if set', () => {
    renderWithProviders(<ParticipantVideoFallback displayName={DISPLAY_NAME} />, {
      provider: { mui: true },
    });
    expect(screen.getByText(DISPLAY_NAME)).toBeInTheDocument();
  });
  it('passes sip participant prop down to the avatar', () => {
    renderWithProviders(<ParticipantVideoFallback isSipParticipant={true} />, {
      provider: { mui: true },
    });
    expect(screen.getByTestId('sip-participant')).toBeInTheDocument();
  });
  it('passes avatar url prop down to the avatar', () => {
    renderWithProviders(<ParticipantVideoFallback avatarUrl="url" />, {
      provider: { mui: true },
    });
    expect(screen.getByText('url')).toBeInTheDocument();
  });
});
