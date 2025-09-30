// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useMediaQuery } from '@mui/material';
import { act, fireEvent, screen } from '@testing-library/react';
import { Mock } from 'vitest';

import { fullscreenActions } from '../../../store/slices/fullscreen/slice';
import { configureStore, mockedParticipant, renderWithProviders } from '../../../utils/testUtils';
import LayoutSelection from './LayoutSelection';

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
    renderWithProviders(<LayoutSelection />, { store, provider: { mui: true } });
    act(openMenu);
    const menu = screen.getByRole('menu', { hidden: true });
    expect(menu).toBeInTheDocument();
  });
  it('renders the correct buttons', () => {
    renderWithProviders(<LayoutSelection />, { store, provider: { mui: true } });
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
    const { store } = configureStore({
      initialState: { fullscreen: { supported: true, active: false } },
    });
    renderWithProviders(<LayoutSelection />, { store, provider: { mui: true } });
    act(openMenu);

    const fullscreenMenuItem = getButtonSelector('conference-view-fullscreen');
    expect(fullscreenMenuItem).toBeInTheDocument();
  });

  it('opens fullscreen when clicking the fullscreen button', () => {
    const { store } = configureStore({
      initialState: { fullscreen: { supported: true, active: false } },
    });
    renderWithProviders(<LayoutSelection />, { store, provider: { mui: true } });
    const spyFullscreenRequest = vi.spyOn(fullscreenActions, 'request');

    act(openMenu);

    const fullscreenMenuItem = getButtonSelector('conference-view-fullscreen');

    fireEvent.click(fullscreenMenuItem);
    expect(spyFullscreenRequest).toHaveBeenCalled();
  });

  it('does not render fullscreen button if fullscreen feature is unavailable', () => {
    const { store } = configureStore({
      initialState: { fullscreen: { supported: false, active: false } },
    });
    renderWithProviders(<LayoutSelection />, { store, provider: { mui: true } });

    act(openMenu);

    expect(
      screen.queryByRole('menuitemradio', { name: 'conference-view-fullscreen', hidden: true })
    ).not.toBeInTheDocument();
  });

  it('renders meeting notes option on mobile when meeting notes are available', () => {
    mockUseMediaQuery.mockReturnValue(true);
    const { store } = configureStore({
      initialState: { meetingNotes: { meetingNotesUrl: 'https://example.com/notes' } },
    });

    renderWithProviders(<LayoutSelection />, { store, provider: { snackbar: true, mui: true } });
    act(openMenu);

    expect(mockUseMediaQuery).toHaveBeenCalled();

    const meetingNotesButton = getButtonSelector('moderationbar-button-meeting-notes-tooltip');
    expect(meetingNotesButton).toBeInTheDocument();
  });
});
