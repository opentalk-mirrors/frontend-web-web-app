// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import { RemoteParticipant, Track } from 'livekit-client';
import { PropsWithChildren } from 'react';

import type { CinemaViewParticipant } from '../../../hooks/useCinemaViewParticipants';
import { ConnectionId, ConnectionIdentifier, MediaSessionType, ParticipantId, TileIdentifier } from '../../../types';
import { renderWithProviders } from '../../../utils/testUtils';
import SpeakerWindow, { SpeakerWindowProps } from './SpeakerWindow';

const { mockUseConferenceUiVersion, mockSetAnchor } = vi.hoisted(() => ({
  mockUseConferenceUiVersion: vi.fn(),
  mockSetAnchor: vi.fn(),
}));

vi.mock('../../../hooks', () => ({
  useConferenceUiVersion: () => mockUseConferenceUiVersion(),
}));

vi.mock('../../../provider/SelfViewAnchorContext', () => ({
  useSelfViewAnchor: () => ({ anchor: null, setAnchor: mockSetAnchor }),
}));

interface MockTileParticipantProviderProps {
  connectionIdentifier: ConnectionIdentifier;
  displayName: string;
  remoteParticipant?: RemoteParticipant;
}

vi.mock('../../../provider/TileParticipantProvider', () => ({
  default: ({
    connectionIdentifier,
    displayName,
    remoteParticipant,
    children,
  }: PropsWithChildren<MockTileParticipantProviderProps>) => (
    <div
      data-testid="tileParticipantProvider"
      data-connection-identifier={connectionIdentifier}
      data-display-name={displayName}
      data-remote-identity={remoteParticipant?.identity ?? ''}
    >
      {children}
    </div>
  ),
}));

vi.mock('../../ParticipantWindow', () => ({
  default: ({ source, alwaysShowOverlay }: { source?: MediaSessionType; alwaysShowOverlay?: boolean }) => (
    <div data-testid="participantWindow" data-source={source ?? ''} data-always-show-overlay={alwaysShowOverlay} />
  ),
}));

const connectionIdentifierOf = (index: number) => `participant-${index}:connection-${index}` as ConnectionIdentifier;

const createParticipant = (index: number) =>
  ({
    id: `participant-${index}` as ParticipantId,
    connections: [`connection-${index}` as ConnectionId],
    displayName: `Participant ${index}`,
  }) as CinemaViewParticipant;

const createRemoteParticipant = (index: number) =>
  ({ identity: connectionIdentifierOf(index) }) as unknown as RemoteParticipant;

const featured = (index: number, source: MediaSessionType = Track.Source.Camera): TileIdentifier => ({
  connectionIdentifier: connectionIdentifierOf(index),
  source,
});

const setup = ({
  featuredTile,
  participants = [],
  remoteParticipants = [],
  isV2 = true,
}: {
  featuredTile?: TileIdentifier;
  participants?: CinemaViewParticipant[];
  remoteParticipants?: RemoteParticipant[];
  isV2?: boolean;
}): SpeakerWindowProps => {
  mockUseConferenceUiVersion.mockReturnValue({ isV2 });
  return {
    cinemaViewParticipants: participants,
    remoteParticipantsMap: new Map(remoteParticipants.map((participant) => [participant.identity, participant])),
    featuredTile,
  };
};

const renderSpeakerWindow = (props: SpeakerWindowProps) =>
  renderWithProviders(<SpeakerWindow {...props} />, { provider: { mui: true } });

describe('SpeakerWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders no participant window without featured tile and remote participants', () => {
    const props = setup({ participants: [createParticipant(0)] });
    renderSpeakerWindow(props);
    expect(screen.queryByTestId('tileParticipantProvider')).not.toBeInTheDocument();
    expect(screen.queryByTestId('participantWindow')).not.toBeInTheDocument();
  });

  it('renders no participant window without featured tile, even if LiveKit still reports participants', () => {
    const props = setup({
      participants: [createParticipant(0), createParticipant(1)],
      remoteParticipants: [createRemoteParticipant(1), createRemoteParticipant(0)],
    });
    renderSpeakerWindow(props);
    expect(screen.queryByTestId('tileParticipantProvider')).not.toBeInTheDocument();
    expect(screen.queryByTestId('participantWindow')).not.toBeInTheDocument();
  });

  it('renders the featured tile', () => {
    const props = setup({
      featuredTile: featured(1),
      participants: [createParticipant(0), createParticipant(1)],
      remoteParticipants: [createRemoteParticipant(0), createRemoteParticipant(1)],
    });
    renderSpeakerWindow(props);
    expect(screen.getByTestId('tileParticipantProvider')).toHaveAttribute(
      'data-connection-identifier',
      connectionIdentifierOf(1)
    );
  });

  it('renders the featured camera tile with the LiveKit participant and the controller display name', () => {
    const props = setup({
      featuredTile: featured(1),
      participants: [createParticipant(0), createParticipant(1)],
      remoteParticipants: [createRemoteParticipant(0), createRemoteParticipant(1)],
    });
    renderSpeakerWindow(props);
    const provider = screen.getByTestId('tileParticipantProvider');
    expect(provider).toHaveAttribute('data-connection-identifier', connectionIdentifierOf(1));
    expect(provider).toHaveAttribute('data-display-name', 'Participant 1');
    expect(provider).toHaveAttribute('data-remote-identity', connectionIdentifierOf(1));

    const participantWindow = screen.getByTestId('participantWindow');
    expect(participantWindow).toHaveAttribute('data-source', Track.Source.Camera);
    expect(participantWindow).toHaveAttribute('data-always-show-overlay', 'true');
  });

  it('renders the featured screen share tile with the screen share source', () => {
    const props = setup({
      featuredTile: featured(1, Track.Source.ScreenShare),
      participants: [createParticipant(1)],
      remoteParticipants: [createRemoteParticipant(1)],
    });
    renderSpeakerWindow(props);
    expect(screen.getByTestId('participantWindow')).toHaveAttribute('data-source', Track.Source.ScreenShare);
  });

  it('renders the featured tile with participant data from controller, if LiveKit is unavailable', () => {
    const props = setup({ featuredTile: featured(1), participants: [createParticipant(1)] });
    renderSpeakerWindow(props);
    const provider = screen.getByTestId('tileParticipantProvider');
    expect(provider).toHaveAttribute('data-connection-identifier', connectionIdentifierOf(1));
    expect(provider).toHaveAttribute('data-display-name', 'Participant 1');
    expect(provider).toHaveAttribute('data-remote-identity', '');
  });

  it('falls back to an empty display name if there is no data for this participant from the controller', () => {
    const props = setup({ featuredTile: featured(1), remoteParticipants: [createRemoteParticipant(1)] });
    renderSpeakerWindow(props);
    expect(screen.getByTestId('tileParticipantProvider')).toHaveAttribute('data-display-name', '');
  });
});
