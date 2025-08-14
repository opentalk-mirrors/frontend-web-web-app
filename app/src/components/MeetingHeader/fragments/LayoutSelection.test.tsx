// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useMediaQuery } from '@mui/material';
import { act, fireEvent, screen } from '@testing-library/react';
import { Mock } from 'vitest';

import { configureStore, mockedParticipant, renderWithProviders } from '../../../utils/testUtils';
import LayoutSelection from './LayoutSelection';

const mockFullscreenContext = {
  active: true,
  node: null,
  exit: vi.fn(),
  enter: vi.fn(),
  fullscreenParticipantId: '',
  setRootElement: vi.fn(),
  rootElement: null,
  setHasActiveOverlay: vi.fn(),
  isFullScreenAvailable: vi.fn(),
};

vi.mock('../../../hooks/useFullscreenContext.ts', () => ({ useFullscreenContext: () => mockFullscreenContext }));
vi.mock('@livekit/components-react', () => ({
  useRemoteParticipants: () => [mockedParticipant(0)],
}));

vi.mock('@mui/material', async (importOriginal) => ({
  ...(await importOriginal()),
  useMediaQuery: vi.fn().mockReturnValue(false),
}));

const mockUseMediaQuery = useMediaQuery as Mock;
const openMenu = () => {
  const openButton = screen.getByRole('button', { name: 'conference-view-trigger-button' });
  fireEvent.click(openButton);
};

describe('Layout selection menu', () => {
  const { store } = configureStore();
  afterEach(() => {
    mockUseMediaQuery.mockClear();
  });
  const getButtonSelector = (name: string) => screen.getByRole('menuitemradio', { name, hidden: true });

  it('opens a menu when the open button is clicked', () => {
    renderWithProviders(<LayoutSelection />, { store });
    act(openMenu);
    const menu = screen.getByRole('menu', { hidden: true });
    expect(menu).toBeInTheDocument();
  });
  it('renders the correct buttons', () => {
    renderWithProviders(<LayoutSelection />, { store });
    act(openMenu);
    const gridViewButton = getButtonSelector('conference-view-grid');
    const speakerViewButton = getButtonSelector('conference-view-speaker');
    const cameraFirstButton = getButtonSelector('conference-view-grid-camera-first');
    const moderatorFirstButton = getButtonSelector('conference-view-grid-moderators-first');
    expect(gridViewButton).toBeInTheDocument();
    expect(speakerViewButton).toBeInTheDocument();
    expect(cameraFirstButton).toBeInTheDocument();
    expect(moderatorFirstButton).toBeInTheDocument();
  });

  it('renders fullscreen button if the fullscreen feature is available', () => {
    mockFullscreenContext.isFullScreenAvailable = vi.fn(() => true);
    renderWithProviders(<LayoutSelection />, { store });
    act(openMenu);
    expect(mockFullscreenContext.isFullScreenAvailable).toHaveBeenCalled();

    const fullscreenMenuItem = getButtonSelector('conference-view-fullscreen');
    expect(fullscreenMenuItem).toBeInTheDocument();
  });

  it('opens fullscreen when clicking the fullscreen button', () => {
    mockFullscreenContext.isFullScreenAvailable = vi.fn(() => true);

    renderWithProviders(<LayoutSelection />, { store });
    act(openMenu);
    expect(mockFullscreenContext.isFullScreenAvailable).toHaveBeenCalled();
    const fullscreenMenuItem = getButtonSelector('conference-view-fullscreen');

    fireEvent.click(fullscreenMenuItem);
    expect(mockFullscreenContext.enter).toHaveBeenCalled();
  });

  it('does not render fullscreen button if fullscreen feature is unavailable', () => {
    mockFullscreenContext.isFullScreenAvailable = vi.fn(() => false);

    renderWithProviders(<LayoutSelection />, { store });

    act(openMenu);

    expect(mockFullscreenContext.isFullScreenAvailable).toHaveBeenCalled();

    expect(
      screen.queryByRole('menuitemradio', { name: 'conference-view-fullscreen', hidden: true })
    ).not.toBeInTheDocument();
  });

  it('renders meeting notes option on mobile when meeting notes are available', () => {
    mockUseMediaQuery.mockReturnValue(true);
    const { store } = configureStore({
      initialState: { meetingNotes: { meetingNotesUrl: 'https://example.com/notes' } },
    });

    renderWithProviders(<LayoutSelection />, { store, provider: { snackbar: true } });
    act(openMenu);

    expect(mockUseMediaQuery).toHaveBeenCalled();

    const meetingNotesButton = getButtonSelector('moderationbar-button-meeting-notes-tooltip');
    expect(meetingNotesButton).toBeInTheDocument();
  });
});
