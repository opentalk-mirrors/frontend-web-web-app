// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import type { NameTileProps } from '../../../commonComponents/NameTile';
import SelfViewAnchorContext from '../../../provider/SelfViewAnchorContext';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import { SelfVideoContentProps } from './SelfVideoContent';
import SelfView from './SelfView';

const DEFAULT_VIEWPORT_WIDTH_PX = 1024;

vi.mock('../../../commonComponents/NameTile', () => ({
  __esModule: true,
  default: (props: NameTileProps) => (
    <div data-testid="name-tile">
      {props.displayName}
      {props.showIcons && <div data-testid="icons" />}
    </div>
  ),
}));

vi.mock('./SelfVideoContent', () => ({
  __esModule: true,
  default: (props: SelfVideoContentProps) => <div data-testid="self-video-content">{props.displayName}</div>,
}));

describe('SelfView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('size', () => {
    // Reset to the default afterwards
    afterEach(() => {
      window.happyDOM?.setViewport({ width: DEFAULT_VIEWPORT_WIDTH_PX });
    });

    it.each([
      { width: 390, size: 'sm', expected: { width: '93px', height: '140px' } },
      { width: 1024, size: 'md', expected: { width: '120px', height: '80px' } },
      { width: 1440, size: 'lg', expected: { width: '150px', height: '100px' } },
      { width: 1536, size: 'xl', expected: { width: '150px', height: '100px' } },
    ])('renders with specified fixed size for a $size viewport', ({ width, expected }) => {
      window.happyDOM?.setViewport({ width });

      const { store } = configureStore();
      renderWithProviders(<SelfView />, { store, provider: { mui: true } });

      const container = screen.getByTestId('selfview-container');
      expect(container).toHaveStyle({ width: expected.width, height: expected.height });
    });
  });

  it('renders video content', () => {
    const { store } = configureStore();
    renderWithProviders(<SelfView />, { store, provider: { mui: true } });
    expect(screen.getByTestId('self-video-content')).toBeInTheDocument();
  });

  it('passes display name to video content', () => {
    const { store } = configureStore({
      initialState: {
        user: {
          displayName: 'Bob Benton',
        },
      },
    });
    renderWithProviders(<SelfView />, { store, provider: { mui: true } });
    expect(screen.getByTestId('self-video-content')).toHaveTextContent('Bob Benton');
  });

  it('renders name tile', () => {
    const { store } = configureStore();
    renderWithProviders(<SelfView />, { store, provider: { mui: true } });
    expect(screen.getByTestId('name-tile')).toBeInTheDocument();
  });

  it('passes "you" as name to the name tile', () => {
    const { store } = configureStore();
    renderWithProviders(<SelfView />, { store, provider: { mui: true } });
    expect(screen.getByTestId('name-tile')).toHaveTextContent('global-you');
  });

  it('prevent rendering icons in the name tile', () => {
    const { store } = configureStore();
    renderWithProviders(<SelfView />, { store, provider: { mui: true } });
    expect(screen.getByTestId('name-tile')).not.toContainElement(screen.queryByTestId('icons'));
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

    expect(anchor).toContainElement(screen.getByTestId('self-video-content'));
    expect(container).not.toContainElement(screen.getByTestId('self-video-content'));

    anchor.remove();
  });

  it('renders inline (no portal) when no anchor is set', () => {
    const { store } = configureStore();
    const { container } = renderWithProviders(<SelfView />, { store, provider: { mui: true } });
    expect(container).toContainElement(screen.getByTestId('self-video-content'));
  });
});
