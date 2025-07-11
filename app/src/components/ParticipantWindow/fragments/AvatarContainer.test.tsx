// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { ParticipationKind } from '../../../types';
import { getInitials } from '../../../utils/stringUtils';
import { mockStore, mockedParticipant, renderWithProviders } from '../../../utils/testUtils';
import { AvatarContainer } from './AvatarContainer';

describe('render <AvatarContainer />', () => {
  const participant = mockedParticipant(0);
  const initials = getInitials(participant.displayName, 3);

  it('should render AvatarContainer component with initial', () => {
    const { store } = mockStore(1);
    renderWithProviders(<AvatarContainer participantId={participant.participantId} />, {
      store,
      provider: { mui: true },
    });
    expect(screen.getByTestId('avatarContainer')).toBeInTheDocument();
    expect(screen.getByTestId('participantAvatar')).toBeInTheDocument();
    expect(screen.getByText(initials)).toBeInTheDocument();
  });

  it('render with isSipParticipant flag should not render initials', () => {
    const { store } = mockStore(1, { participantKinds: [ParticipationKind.Sip] });
    renderWithProviders(<AvatarContainer participantId={participant.participantId} />, {
      store,
      provider: { mui: true },
    });
    expect(screen.getByTestId('avatarContainer')).toBeInTheDocument();
    expect(screen.getByTestId('participantAvatar')).toBeInTheDocument();
    expect(screen.queryByTestId('avatarIcon')).not.toBeInTheDocument();
    expect(screen.queryByText(initials)).not.toBeInTheDocument();
  });
});
