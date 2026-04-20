// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useParticipants } from '@livekit/components-react';
import { screen } from '@testing-library/react';
import { Mock } from 'vitest';

import { mockedParticipant, renderWithProviders } from '../../utils/testUtils';
import NameTile from './NameTile';

vi.mock('@livekit/components-react', () => ({
  useParticipants: vi.fn(),
  useRoomContext: vi.fn(),
}));

describe('NameTile with activated media', () => {
  const participant = mockedParticipant(0);

  beforeEach(() => {
    (useParticipants as Mock).mockReturnValue([{ ...participant, isMicrophoneEnabled: true, isCameraEnabled: true }]);
  });

  describe('NameTile with local media state', () => {
    const participant = mockedParticipant(0);
    const displayName = participant.displayName;

    it('render NameTile component with local video on', () => {
      renderWithProviders(<NameTile videoOn audioOn={false} displayName={displayName} />, {
        provider: { mui: true },
      });

      expect(screen.getByTestId('nameTile')).toBeInTheDocument();
      expect(screen.getByText(displayName)).toBeInTheDocument();
      expect(screen.getByTestId('micOff')).toBeInTheDocument();
      expect(screen.queryByTestId('camOff')).not.toBeInTheDocument();
    });

    it('render NameTile component with local audio on', () => {
      renderWithProviders(<NameTile audioOn videoOn={false} displayName={displayName} />, {
        provider: { mui: true },
      });

      expect(screen.getByTestId('nameTile')).toBeInTheDocument();
      expect(screen.getByText(displayName)).toBeInTheDocument();
      expect(screen.queryByTestId('micOff')).not.toBeInTheDocument();
      expect(screen.getByTestId('camOff')).toBeInTheDocument();
    });

    it('render NameTile component with local video and audio on', () => {
      renderWithProviders(<NameTile videoOn audioOn displayName={displayName} />, { provider: { mui: true } });

      expect(screen.getByTestId('nameTile')).toBeInTheDocument();
      expect(screen.getByText(displayName)).toBeInTheDocument();
      expect(screen.queryByTestId('micOff')).not.toBeInTheDocument();
      expect(screen.queryByTestId('camOff')).not.toBeInTheDocument();
    });
  });
});
