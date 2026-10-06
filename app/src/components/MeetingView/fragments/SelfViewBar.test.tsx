// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useLocalParticipant } from '@livekit/components-react';
import { screen } from '@testing-library/react';
import { Mock } from 'vitest';

import type { NameTileProps } from '../../../commonComponents/NameTile';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import SelfViewBar from './SelfViewBar';

vi.mock('@livekit/components-react', () => ({
  useLocalParticipant: vi.fn(),
}));

vi.mock('../../../assets/icons', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../assets/icons')>()),
  CameraOnIcon: () => <svg data-testid="camera-on-icon" />,
}));

vi.mock('../../HandRaisedIndicator', () => ({
  __esModule: true,
  default: ({ label }: { label: string }) => <div data-testid="hand-raised-indicator">{label}</div>,
}));

vi.mock('../../../commonComponents/NameTile', () => ({
  __esModule: true,
  default: (props: NameTileProps) => (
    <div data-testid="name-tile">
      {props.displayName}
      {props.showIcons && <div data-testid="icons" />}
    </div>
  ),
}));

describe('SelfViewBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useLocalParticipant as Mock).mockReturnValue({ isCameraEnabled: true });
  });

  it('puts the given id on the root element', () => {
    const { store } = configureStore();
    renderWithProviders(<SelfViewBar id="bar-id" />, { store, provider: { mui: true } });
    expect(screen.getByTestId('selfview-bar')).toHaveAttribute('id', 'bar-id');
  });

  it('shows the camera on icon when the camera is enabled', () => {
    const { store } = configureStore();
    renderWithProviders(<SelfViewBar id="bar-id" />, { store, provider: { mui: true } });
    expect(screen.getByTestId('camera-on-icon')).toBeInTheDocument();
  });

  it('hides the camera on icon when the camera is disabled', () => {
    (useLocalParticipant as Mock).mockReturnValue({ isCameraEnabled: false });
    const { store } = configureStore();
    renderWithProviders(<SelfViewBar id="bar-id" />, { store, provider: { mui: true } });
    expect(screen.queryByTestId('camera-on-icon')).not.toBeInTheDocument();
  });

  it('passes "you" as name to the name tile', () => {
    const { store } = configureStore();
    renderWithProviders(<SelfViewBar id="bar-id" />, { store, provider: { mui: true } });
    expect(screen.getByTestId('name-tile')).toHaveTextContent('global-you');
  });

  it('prevents rendering icons in the name tile', () => {
    const { store } = configureStore();
    renderWithProviders(<SelfViewBar id="bar-id" />, { store, provider: { mui: true } });
    expect(screen.getByTestId('name-tile')).toBeInTheDocument();
    expect(screen.queryByTestId('icons')).not.toBeInTheDocument();
  });

  it('renders the hand raised indicator with the "you want to say something" label when our hand is up', () => {
    const { store } = configureStore({
      initialState: {
        moderation: {
          hasHandUp: true,
        },
      },
    });
    renderWithProviders(<SelfViewBar id="bar-id" />, { store, provider: { mui: true } });
    expect(screen.getByTestId('hand-raised-indicator')).toHaveTextContent('indicator-you-have-raised-hand');
  });

  it('does not render the hand raised indicator when our hand is down', () => {
    const { store } = configureStore({
      initialState: {
        moderation: {
          hasHandUp: false,
        },
      },
    });
    renderWithProviders(<SelfViewBar id="bar-id" />, { store, provider: { mui: true } });
    expect(screen.queryByTestId('hand-raised-indicator')).not.toBeInTheDocument();
  });
});
