// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { renderWithProviders, mockedParticipant, configureStore } from '../../../utils/testUtils';
import HandRaisedIndicator from './HandRaisedIndicator';

const participant1 = mockedParticipant(1);
const participantHandUp = { ...mockedParticipant(2), handIsUp: true };

const { store } = configureStore({
  initialState: {
    participants: {
      ids: [participant1.id, participantHandUp.id],
      entities: {
        [participant1.id]: { ...participant1 },
        [participantHandUp.id]: { ...participantHandUp },
      },
    },
  },
});

describe('HandRaisedIndicator', () => {
  test('render without crashing with flag handIsUp = false,, should have scale(0)', () => {
    renderWithProviders(<HandRaisedIndicator participantId={participant1.id} />, { store });

    expect(screen.queryByLabelText('indicator-has-raised-hand')).not.toBeInTheDocument();
  });

  test('render for handIsUp = true, should have scalse(1)', () => {
    renderWithProviders(<HandRaisedIndicator participantId={participantHandUp.id} />, { store });

    expect(screen.getByLabelText('indicator-has-raised-hand')).toBeInTheDocument();
    expect(screen.getByLabelText('indicator-has-raised-hand')).toHaveStyle('transform: scale(1);');
  });
});
