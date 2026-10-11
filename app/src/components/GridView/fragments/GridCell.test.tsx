// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import { Track } from 'livekit-client';
import { ComponentProps } from 'react';

import { MediaSessionType } from '../../../types';
import { mockStore, mockedParticipant, renderWithProviders } from '../../../utils/testUtils';
import GridCell from './GridCell';

const useSpeakingParticipantsMock = vi.fn();
vi.mock('@livekit/components-react', () => ({
  useRoomContext: () => vi.fn(),
  useParticipantContext: () => mockedParticipant(0),
  useSpeakingParticipants: () => useSpeakingParticipantsMock(),
}));

vi.mock('../../ParticipantWindow', () => ({
  __esModule: true,
  default: ({ source }: { source?: MediaSessionType }) => (
    <div data-testid="participantWindow" data-source={source}></div>
  ),
}));

// Pass `styled` through so the cell renders the mocked `Box` and the `highlight` prop that drives
// the speaker outline can be asserted instead of the generated `::after` styles.
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof import('@mui/material')>('@mui/material');

  return {
    ...actual,
    styled: (component: () => unknown) => () => component,
    Box: ({ highlight, ...props }: ComponentProps<'div'> & { highlight?: boolean }) => (
      <div data-highlight={highlight} {...props} />
    ),
  };
});

describe('GridCell', () => {
  const renderGridCell = ({
    highlight,
    source = Track.Source.Camera,
  }: {
    highlight: boolean;
    source?: MediaSessionType;
  }) => {
    const { store } = mockStore(1);
    renderWithProviders(<GridCell direction="left" highlight={highlight} source={source} />, {
      store,
      provider: { mui: true },
    });
  };

  beforeEach(() => {
    useSpeakingParticipantsMock.mockReturnValue([mockedParticipant(0)]);
  });

  it('renders the participant window', () => {
    renderGridCell({ highlight: true });
    expect(screen.getByTestId('cinemaCell')).toBeInTheDocument();
    expect(screen.getByTestId('participantWindow')).toBeInTheDocument();
  });

  it('does not highlight the speaking participant when highlighting is disabled', () => {
    renderGridCell({ highlight: false });
    expect(screen.getByTestId('cinemaCell')).toHaveAttribute('data-highlight', 'false');
  });

  it('highlights the camera tile of the speaking participant', () => {
    renderGridCell({ highlight: true, source: Track.Source.ScreenShare });
    expect(screen.getByTestId('cinemaCell')).toHaveAttribute('data-highlight', 'false');
  });

  it('does not highlight the screen share tile of the speaking participant', () => {
    renderGridCell({ highlight: true, source: Track.Source.ScreenShare });
    expect(screen.getByTestId('cinemaCell')).toHaveAttribute('data-highlight', 'false');
  });

  it('does not highlight the participant when someone else is speaking', () => {
    useSpeakingParticipantsMock.mockReturnValue([mockedParticipant(1)]);
    renderGridCell({ highlight: true });
    expect(screen.getByTestId('cinemaCell')).toHaveAttribute('data-highlight', 'false');
  });

  it('does not highlight the participant when nobody is speaking', () => {
    useSpeakingParticipantsMock.mockReturnValue([]);
    renderGridCell({ highlight: true });
    expect(screen.getByTestId('cinemaCell')).toHaveAttribute('data-highlight', 'false');
  });
});
