// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { configureStore, mockedParticipant, renderWithProviders } from '../../../utils/testUtils';
import ParticipantHandRaisedIndicator from './ParticipantHandRaisedIndicator';

// The global mock ignores interpolation values, so we echo them back to be able to assert on the participant name.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { participantName?: string }) => `${key}:${options?.participantName ?? ''}`,
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('../../HandRaisedIndicator', () => ({
  __esModule: true,
  default: ({ label, className }: { label: string; className?: string }) => (
    <div data-testid="hand-raised-indicator" className={className}>
      {label}
    </div>
  ),
}));

const participantHandDown = mockedParticipant(1);
const participantHandUp = { ...mockedParticipant(2), handIsUp: true };
const participantHandUpWithoutTimestamp = { ...mockedParticipant(3), handIsUp: true, handUpdatedAt: undefined };
const participantWithLongName = { ...mockedParticipant(4), handIsUp: true, displayName: 'a'.repeat(150) };

const createStore = () =>
  configureStore({
    initialState: {
      participants: {
        ids: [
          participantHandDown.id,
          participantHandUp.id,
          participantHandUpWithoutTimestamp.id,
          participantWithLongName.id,
        ],
        entities: {
          [participantHandDown.id]: participantHandDown,
          [participantHandUp.id]: participantHandUp,
          [participantHandUpWithoutTimestamp.id]: participantHandUpWithoutTimestamp,
          [participantWithLongName.id]: participantWithLongName,
        },
      },
    },
  }).store;

describe('ParticipantHandRaisedIndicator', () => {
  it('should mounts an empty live region, if the hand is down', () => {
    renderWithProviders(<ParticipantHandRaisedIndicator participantId={participantHandDown.id} />, {
      store: createStore(),
    });
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });

  it('should not render the hand raised indicator when the hand is down', () => {
    renderWithProviders(<ParticipantHandRaisedIndicator participantId={participantHandDown.id} />, {
      store: createStore(),
    });
    expect(screen.queryByTestId('hand-raised-indicator')).not.toBeInTheDocument();
  });

  it('should label the indicator with the participant name when the hand is up', () => {
    renderWithProviders(<ParticipantHandRaisedIndicator participantId={participantHandUp.id} />, {
      store: createStore(),
    });
    expect(screen.getByTestId('hand-raised-indicator')).toHaveTextContent(
      `indicator-participant-has-raised-hand:${participantHandUp.displayName}`
    );
  });

  it('should truncate long participant names in the label to 100 characters', () => {
    renderWithProviders(<ParticipantHandRaisedIndicator participantId={participantWithLongName.id} />, {
      store: createStore(),
    });
    expect(screen.getByTestId('hand-raised-indicator')).toHaveTextContent(
      `indicator-participant-has-raised-hand:${'a'.repeat(97)}...`,
      { normalizeWhitespace: true }
    );
  });

  it('should announce the raised hand to assistive technology', () => {
    renderWithProviders(<ParticipantHandRaisedIndicator participantId={participantHandUp.id} />, {
      store: createStore(),
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toContainElement(screen.getByTestId('hand-raised-indicator'));
  });

  it('should not render the hand indicator when the hand update timestamp is missing', () => {
    renderWithProviders(<ParticipantHandRaisedIndicator participantId={participantHandUpWithoutTimestamp.id} />, {
      store: createStore(),
    });

    expect(screen.queryByTestId('hand-raised-indicator')).not.toBeInTheDocument();
  });

  it('should not render for an unknown participant', () => {
    renderWithProviders(<ParticipantHandRaisedIndicator participantId={mockedParticipant(99).id} />, {
      store: createStore(),
    });

    expect(screen.queryByTestId('hand-raised-indicator')).not.toBeInTheDocument();
  });
});
