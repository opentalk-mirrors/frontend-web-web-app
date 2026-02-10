// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useMediaQuery } from '@mui/material';
import { BackendModules } from '@opentalk/rest-api-rtk-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('Layout selection menu', () => {
  const { store } = configureStore();
  afterEach(() => {
    mockUseMediaQuery.mockClear();
  });
  const getButtonSelector = (name: string) => screen.getByRole('menuitemradio', { name });

  it('opens a menu when the open button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LayoutSelection />, { store, provider: { mui: true } });
    await user.click(screen.getByRole('button', { name: 'conference-view-trigger-button' }));
    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();
  });
  it('renders the correct buttons', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LayoutSelection />, { store, provider: { mui: true } });
    await user.click(screen.getByRole('button', { name: 'conference-view-trigger-button' }));
    const gridViewButton = getButtonSelector('conference-view-grid');
    const speakerViewButton = getButtonSelector('conference-view-speaker');
    const cameraFirstButton = getButtonSelector('conference-view-grid-camera-first');
    const moderatorFirstButton = getButtonSelector('conference-view-grid-moderators-first');
    const firstJoinedButton = getButtonSelector('conference-view-grid-first-joined');
    expect(gridViewButton).toBeInTheDocument();
    expect(speakerViewButton).toBeInTheDocument();
    expect(cameraFirstButton).toBeInTheDocument();
    expect(moderatorFirstButton).toBeInTheDocument();
    expect(firstJoinedButton).toBeInTheDocument();
  });

  it('renders fullscreen button if the fullscreen feature is available', async () => {
    const user = userEvent.setup();
    const { store } = configureStore({
      initialState: { fullscreen: { supported: true, active: false } },
    });
    renderWithProviders(<LayoutSelection />, { store, provider: { mui: true } });
    await user.click(screen.getByRole('button', { name: 'conference-view-trigger-button' }));

    const fullscreenMenuItem = getButtonSelector('conference-view-fullscreen');
    expect(fullscreenMenuItem).toBeInTheDocument();
  });

  it('opens fullscreen when clicking the fullscreen button', async () => {
    const user = userEvent.setup();
    const { store } = configureStore({
      initialState: { fullscreen: { supported: true, active: false } },
    });
    renderWithProviders(<LayoutSelection />, { store, provider: { mui: true } });
    const spyFullscreenRequest = vi.spyOn(fullscreenActions, 'request');

    await user.click(screen.getByRole('button', { name: 'conference-view-trigger-button' }));

    const fullscreenMenuItem = getButtonSelector('conference-view-fullscreen');

    await user.click(fullscreenMenuItem);
    expect(spyFullscreenRequest).toHaveBeenCalled();
  });

  it('does not render fullscreen button if fullscreen feature is unavailable', async () => {
    const user = userEvent.setup();
    const { store } = configureStore({
      initialState: { fullscreen: { supported: false, active: false } },
    });
    renderWithProviders(<LayoutSelection />, { store, provider: { mui: true } });

    await user.click(screen.getByRole('button', { name: 'conference-view-trigger-button' }));

    expect(screen.queryByRole('menuitemradio', { name: 'conference-view-fullscreen' })).not.toBeInTheDocument();
  });

  it('renders meeting notes option on mobile when meeting notes are available', async () => {
    const user = userEvent.setup();
    mockUseMediaQuery.mockReturnValue(true);
    const { store } = configureStore({
      initialState: { config: { enabledModules: [BackendModules.MeetingNotes] } },
    });

    renderWithProviders(<LayoutSelection />, { store, provider: { snackbar: true, mui: true } });
    await user.click(screen.getByRole('button', { name: 'conference-view-trigger-button' }));

    expect(mockUseMediaQuery).toHaveBeenCalled();

    const meetingNotesButton = getButtonSelector('moderationbar-button-meeting-notes-tooltip');
    expect(meetingNotesButton).toBeInTheDocument();
  });

  it('closes the menu after clicking on a menu item', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LayoutSelection />, { store, provider: { mui: true } });
    await user.click(screen.getByRole('button', { name: 'conference-view-trigger-button' }));

    const gridViewButton = getButtonSelector('conference-view-grid');
    await user.click(gridViewButton);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(gridViewButton).not.toBeInTheDocument();
  });

  it('allows the selection of only one layout at a time', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LayoutSelection />, { store, provider: { mui: true } });
    await user.click(screen.getByRole('button', { name: 'conference-view-trigger-button' }));

    const gridViewButton = getButtonSelector('conference-view-grid');
    await user.click(gridViewButton);

    await user.click(screen.getByRole('button', { name: 'conference-view-trigger-button' }));
    expect(gridViewButton).toHaveAttribute('aria-checked', 'true');

    const speakerViewButton = getButtonSelector('conference-view-speaker');
    expect(speakerViewButton).toHaveAttribute('aria-checked', 'false');

    await user.click(speakerViewButton);
    await user.click(screen.getByRole('button', { name: 'conference-view-trigger-button' }));
    const updatedGridViewButton = getButtonSelector('conference-view-grid');

    expect(updatedGridViewButton).toHaveAttribute('aria-checked', 'false');
    expect(speakerViewButton).toHaveAttribute('aria-checked', 'true');
  });
  it('allows the selection of only one sorting option at a time', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LayoutSelection />, { store, provider: { mui: true } });
    await user.click(screen.getByRole('button', { name: 'conference-view-trigger-button' }));

    const cameraFirstButton = getButtonSelector('conference-view-grid-camera-first');
    await user.click(cameraFirstButton);
    expect(cameraFirstButton).toHaveAttribute('aria-checked', 'true');

    await user.click(screen.getByRole('button', { name: 'conference-view-trigger-button' }));

    const moderatorFirstButton = getButtonSelector('conference-view-grid-moderators-first');
    await user.click(moderatorFirstButton);
    await user.click(screen.getByRole('button', { name: 'conference-view-trigger-button' }));

    const updatedCameraFirstButton = getButtonSelector('conference-view-grid-camera-first');
    expect(moderatorFirstButton).toHaveAttribute('aria-checked', 'true');
    expect(updatedCameraFirstButton).toHaveAttribute('aria-checked', 'false');
  });
  it('allows the selection of one sorting option and one layout option', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LayoutSelection />, { store, provider: { mui: true } });
    await user.click(screen.getByRole('button', { name: 'conference-view-trigger-button' }));

    const gridViewButton = getButtonSelector('conference-view-grid');
    await user.click(gridViewButton);
    await user.click(screen.getByRole('button', { name: 'conference-view-trigger-button' }));
    expect(gridViewButton).toHaveAttribute('aria-checked', 'true');

    const cameraFirstButton = getButtonSelector('conference-view-grid-camera-first');
    await user.click(cameraFirstButton);
    await user.click(screen.getByRole('button', { name: 'conference-view-trigger-button' }));

    expect(cameraFirstButton).toHaveAttribute('aria-checked', 'true');

    expect(gridViewButton).toHaveAttribute('aria-checked', 'true');
  });
  it('does not reset sorting option to first joined when switching view', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LayoutSelection />, { store, provider: { mui: true } });
    await user.click(screen.getByRole('button', { name: 'conference-view-trigger-button' }));

    const cameraFirstButton = getButtonSelector('conference-view-grid-camera-first');
    const firstJoinedButton = getButtonSelector('conference-view-grid-first-joined');
    await user.click(cameraFirstButton);
    await user.click(screen.getByRole('button', { name: 'conference-view-trigger-button' }));

    expect(cameraFirstButton).toHaveAttribute('aria-checked', 'true');
    expect(firstJoinedButton).toHaveAttribute('aria-checked', 'false');

    const speakerViewButton = getButtonSelector('conference-view-speaker');
    await user.click(speakerViewButton);
    await user.click(screen.getByRole('button', { name: 'conference-view-trigger-button' }));

    const updatedFirstJoinedButton = getButtonSelector('conference-view-grid-first-joined');
    const updatedCameraFirstButton = getButtonSelector('conference-view-grid-camera-first');
    expect(speakerViewButton).toHaveAttribute('aria-checked', 'true');
    expect(updatedFirstJoinedButton).toHaveAttribute('aria-checked', 'false');
    expect(updatedCameraFirstButton).toHaveAttribute('aria-checked', 'true');
  });
});
