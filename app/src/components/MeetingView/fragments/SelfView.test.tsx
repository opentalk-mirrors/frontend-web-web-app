// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useLocalParticipant } from '@livekit/components-react';
import { screen } from '@testing-library/react';
import { Track } from 'livekit-client';
import { Mock } from 'vitest';

import SelfViewAnchorContext from '../../../provider/SelfViewAnchorContext';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import SelfView from './SelfView';

const DEFAULT_VIEWPORT_WIDTH_PX = 1024;

vi.mock('@livekit/components-react', () => ({
  useLocalParticipant: vi.fn(),
  VideoTrack: () => (
    <video data-testid="video-track">
      <track kind="captions" />
    </video>
  ),
}));

vi.mock('../../../commonComponents/NameTile', () => ({
  __esModule: true,
  default: () => <div data-testid="name-tile" />,
}));

describe('SelfView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useLocalParticipant as Mock).mockReturnValue({
      isCameraEnabled: true,
      cameraTrack: {
        source: Track.Source.Camera,
      },
    });
  });

  describe('size', () => {
    // Reset to the default afterwards
    afterEach(() => {
      window.happyDOM?.setViewport({ width: DEFAULT_VIEWPORT_WIDTH_PX });
    });

    it.each([
      { width: 600, size: 'sm', expected: { width: '93px', height: '140px' } },
      { width: 900, size: 'md', expected: { width: '120px', height: '80px' } },
      { width: 1200, size: 'lg', expected: { width: '150px', height: '100px' } },
      { width: 1536, size: 'xl', expected: { width: '150px', height: '100px' } },
    ])('renders with specified fixed size for a $size viewport', ({ width, expected }) => {
      window.happyDOM?.setViewport({ width });

      const { store } = configureStore();
      renderWithProviders(<SelfView />, { store, provider: { mui: true } });

      const container = screen.getByTestId('selfview-container');
      expect(container).toHaveStyle({ width: expected.width, height: expected.height });
    });
  });

  it('renders video if camera is enabled and video track is present', () => {
    const { store } = configureStore();
    renderWithProviders(<SelfView />, { store, provider: { mui: true } });
    expect(screen.getByTestId('video-track')).toBeInTheDocument();
  });

  it('does not render video if camera is disabled and video track is present', () => {
    const { store } = configureStore();
    (useLocalParticipant as Mock).mockReturnValue({
      isCameraEnabled: false,
      cameraTrack: {
        source: Track.Source.Camera,
      },
    });
    renderWithProviders(<SelfView />, { store, provider: { mui: true } });
    expect(screen.queryByTestId('video-track')).not.toBeInTheDocument();
  });

  it('does not render video if camera is enabled and video track is not present', () => {
    const { store } = configureStore();
    (useLocalParticipant as Mock).mockReturnValue({
      isCameraEnabled: true,
      cameraTrack: undefined,
    });
    renderWithProviders(<SelfView />, { store, provider: { mui: true } });
    expect(screen.queryByTestId('video-track')).not.toBeInTheDocument();
  });

  it('renders name tile', () => {
    const { store } = configureStore();
    renderWithProviders(<SelfView />, { store, provider: { mui: true } });
    expect(screen.getByTestId('name-tile')).toBeInTheDocument();
  });

  it('portals into the provided anchor element', () => {
    const { store } = configureStore();
    const anchor = document.createElement('div');
    anchor.setAttribute('data-testid', 'anchor');
    document.body.appendChild(anchor);

    const { container } = renderWithProviders(
      <SelfViewAnchorContext.Provider value={{ anchor, setAnchor: vi.fn() }}>
        <SelfView />
      </SelfViewAnchorContext.Provider>,
      { store, provider: { mui: true } }
    );

    expect(anchor).toContainElement(screen.getByTestId('video-track'));
    expect(container).not.toContainElement(screen.getByTestId('video-track'));

    anchor.remove();
  });

  it('renders inline (no portal) when no anchor is set', () => {
    const { store } = configureStore();
    const { container } = renderWithProviders(<SelfView />, { store, provider: { mui: true } });
    expect(container).toContainElement(screen.getByTestId('video-track'));
  });
});
