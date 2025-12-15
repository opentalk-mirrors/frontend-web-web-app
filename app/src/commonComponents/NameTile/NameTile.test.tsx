// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useParticipants } from '@livekit/components-react';
import { screen } from '@testing-library/react';
import { Mock } from 'vitest';

import { constructConnectionIdentifier } from '../../utils/constructConnectionIdentifier';
import { mockedParticipant, renderWithProviders } from '../../utils/testUtils';
import NameTile from './NameTile';

vi.mock('@livekit/components-react', () => ({
  useParticipants: vi.fn(),
  useRoomContext: vi.fn(),
}));

describe('NameTile with activated media', () => {
  const participant = mockedParticipant(0);
  const displayName = participant.displayName;
  const connectionIdentifier = constructConnectionIdentifier(participant.id, participant.connections[0]);
  beforeEach(() => {
    (useParticipants as Mock).mockReturnValue([{ ...participant, isMicrophoneEnabled: true, isCameraEnabled: true }]);
  });

  it('render NameTile component with audio on', () => {
    renderWithProviders(
      <NameTile displayName={participant.displayName} connectionIdentifier={connectionIdentifier} />,
      {
        provider: { mui: true },
      }
    );

    expect(screen.getByTestId('nameTile')).toBeInTheDocument();
    expect(screen.getByText(participant.displayName)).toBeInTheDocument();
    expect(screen.queryByTestId('micOff')).not.toBeInTheDocument();
  });

  it('render NameTile component with video on', () => {
    renderWithProviders(<NameTile displayName={displayName} connectionIdentifier={connectionIdentifier} />, {
      provider: { mui: true },
    });

    expect(screen.getByTestId('nameTile')).toBeInTheDocument();
    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.queryByTestId('camOff')).not.toBeInTheDocument();
  });

  it('render NameTile component with video and audio on', () => {
    renderWithProviders(<NameTile displayName={displayName} connectionIdentifier={connectionIdentifier} />, {
      provider: { mui: true },
    });

    expect(screen.getByTestId('nameTile')).toBeInTheDocument();
    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.queryByTestId('iconBox')).not.toBeInTheDocument();
  });
});

describe('NameTile with deactivated media', () => {
  const participant = mockedParticipant(0);
  const displayName = participant.displayName;
  const connectionIdentifier = constructConnectionIdentifier(participant.id, participant.connections[0]);

  beforeEach(() => {
    (useParticipants as Mock).mockReturnValue([participant]);
  });

  it('render NameTile component with audio off', () => {
    renderWithProviders(<NameTile displayName={displayName} connectionIdentifier={connectionIdentifier} />, {
      provider: { mui: true },
    });

    expect(screen.getByTestId('nameTile')).toBeInTheDocument();
    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.getByTestId('micOff')).toBeInTheDocument();
  });

  it('render NameTile component with video off', () => {
    renderWithProviders(<NameTile displayName={displayName} connectionIdentifier={connectionIdentifier} />, {
      provider: { mui: true },
    });

    expect(screen.getByTestId('nameTile')).toBeInTheDocument();
    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.getByTestId('micOff')).toBeInTheDocument();
  });
});

describe('NameTile with local media state', () => {
  const participant = mockedParticipant(0);
  const displayName = participant.displayName;

  it('render NameTile component with local video on', () => {
    renderWithProviders(<NameTile localVideoOn localAudioOn={false} displayName={displayName} />, {
      provider: { mui: true },
    });

    expect(screen.getByTestId('nameTile')).toBeInTheDocument();
    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.getByTestId('micOff')).toBeInTheDocument();
    expect(screen.queryByTestId('camOff')).not.toBeInTheDocument();
  });

  it('render NameTile component with local audio on', () => {
    renderWithProviders(<NameTile localAudioOn localVideoOn={false} displayName={displayName} />, {
      provider: { mui: true },
    });

    expect(screen.getByTestId('nameTile')).toBeInTheDocument();
    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.queryByTestId('micOff')).not.toBeInTheDocument();
    expect(screen.getByTestId('camOff')).toBeInTheDocument();
  });

  it('render NameTile component with local video and audio on', () => {
    renderWithProviders(<NameTile localVideoOn localAudioOn displayName={displayName} />, { provider: { mui: true } });

    expect(screen.getByTestId('nameTile')).toBeInTheDocument();
    expect(screen.getByText(displayName)).toBeInTheDocument();
    expect(screen.queryByTestId('micOff')).not.toBeInTheDocument();
    expect(screen.queryByTestId('camOff')).not.toBeInTheDocument();
  });
});
