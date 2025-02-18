// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, cleanup } from '@testing-library/react';

import { ParticipantId } from '../../types';
import { mockedParticipant, renderWithProviders } from '../../utils/testUtils';
import NameTile from './NameTile';

jest.mock('@livekit/components-react', () => ({
  useParticipants: () => [mockedParticipant(0)],
  useRoomContext: () => jest.fn(),
}));

describe('render <NameTile />', () => {
  const participant = mockedParticipant(0);
  const displayName = participant.displayName;
  const participantId = participant.id as ParticipantId;
  beforeEach(() => cleanup());

  test('render NameTile component with audio on', () => {
    renderWithProviders(<NameTile displayName={displayName} participantId={participantId} />, {
      provider: { mui: true },
    });

    expect(screen.getByTestId('nameTile')).toBeInTheDocument();
    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.getByTestId('micOff')).toBeInTheDocument();
  });

  test('render NameTile component with audio off', () => {
    renderWithProviders(<NameTile displayName={displayName} participantId={participantId} />, {
      provider: { mui: true },
    });

    expect(screen.getByTestId('nameTile')).toBeInTheDocument();
    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.getByTestId('micOff')).toBeInTheDocument();
  });

  test('render NameTile component with video on', () => {
    renderWithProviders(<NameTile displayName={displayName} participantId={participantId} />, {
      provider: { mui: true },
    });

    expect(screen.getByTestId('nameTile')).toBeInTheDocument();
    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.queryByTestId('camOff')).toBeInTheDocument();
  });

  test('render NameTile component with video and audio on', () => {
    renderWithProviders(<NameTile displayName={displayName} participantId={participantId} />, {
      provider: { mui: true },
    });

    expect(screen.getByTestId('nameTile')).toBeInTheDocument();
    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.queryByTestId('iconBox')).toBeInTheDocument();
  });

  test('render NameTile component with local video on', () => {
    renderWithProviders(<NameTile localVideoOn localAudioOn={false} displayName={displayName} />, {
      provider: { mui: true },
    });

    expect(screen.getByTestId('nameTile')).toBeInTheDocument();
    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.queryByTestId('micOff')).toBeInTheDocument();
    expect(screen.queryByTestId('camOff')).not.toBeInTheDocument();
  });

  test('render NameTile component with local audio on', () => {
    renderWithProviders(<NameTile localAudioOn localVideoOn={false} displayName={displayName} />, {
      provider: { mui: true },
    });

    expect(screen.getByTestId('nameTile')).toBeInTheDocument();
    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.queryByTestId('micOff')).not.toBeInTheDocument();
    expect(screen.queryByTestId('camOff')).toBeInTheDocument();
  });

  test('render NameTile component with local video and audio on', () => {
    renderWithProviders(<NameTile localVideoOn localAudioOn displayName={displayName} />, { provider: { mui: true } });

    expect(screen.getByTestId('nameTile')).toBeInTheDocument();
    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.queryByTestId('micOff')).not.toBeInTheDocument();
    expect(screen.queryByTestId('camOff')).not.toBeInTheDocument();
  });
});
