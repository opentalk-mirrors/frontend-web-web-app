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
  const getButtonSelector = (name: string) => screen.getByRole('button', { name });

  it('opens a dialog when the open button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LayoutSelection />, { store, provider: { mui: true } });
    await user.click(screen.getByRole('button', { name: 'layout-selection-trigger-button' }));
    const dialog = screen.getByRole('dialog', { name: 'layout-selection-title' });
    expect(dialog).toBeInTheDocument();
  });

  it('renders the correct buttons', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LayoutSelection />, { store, provider: { mui: true } });
    await user.click(screen.getByRole('button', { name: 'layout-selection-trigger-button' }));
    const closeButton = getButtonSelector('global-close');
    const gridViewButton = getButtonSelector('layout-selection-grid');
    const speakerViewButton = getButtonSelector('layout-selection-speaker');

    expect(closeButton).toBeInTheDocument();
    expect(gridViewButton).toBeInTheDocument();
    expect(speakerViewButton).toBeInTheDocument();
  });

  it('renders a combobox containing camera sorting options', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LayoutSelection />, { store, provider: { mui: true } });
    await user.click(screen.getByRole('button', { name: 'layout-selection-trigger-button' }));
    const cameraSortingSelect = screen.getByRole('combobox', { name: 'layout-selection-sorting' });
    expect(cameraSortingSelect).toBeInTheDocument();
    await user.click(cameraSortingSelect);

    const cameraFirstOption = screen.getByRole('option', { name: 'layout-selection-grid-camera-first' });
    const firstJoinedOption = screen.getByRole('option', { name: 'layout-selection-grid-first-joined' });
    const moderatorFirstOption = screen.getByRole('option', { name: 'layout-selection-grid-moderators-first' });
    expect(cameraFirstOption).toBeInTheDocument();
    expect(firstJoinedOption).toBeInTheDocument();
    expect(moderatorFirstOption).toBeInTheDocument();
  });

  it('renders fullscreen button if the fullscreen feature is available', async () => {
    const user = userEvent.setup();
    const { store } = configureStore({
      initialState: { fullscreen: { supported: true, active: false } },
    });
    renderWithProviders(<LayoutSelection />, { store, provider: { mui: true } });
    await user.click(screen.getByRole('button', { name: 'layout-selection-trigger-button' }));

    const fullscreenMenuItem = getButtonSelector('layout-selection-fullscreen');
    expect(fullscreenMenuItem).toBeInTheDocument();
  });

  it('opens fullscreen when clicking the fullscreen button', async () => {
    const user = userEvent.setup();
    const { store } = configureStore({
      initialState: { fullscreen: { supported: true, active: false } },
    });
    renderWithProviders(<LayoutSelection />, { store, provider: { mui: true } });
    const spyFullscreenRequest = vi.spyOn(fullscreenActions, 'request');

    await user.click(screen.getByRole('button', { name: 'layout-selection-trigger-button' }));

    const fullscreenMenuItem = getButtonSelector('layout-selection-fullscreen');

    await user.click(fullscreenMenuItem);
    expect(spyFullscreenRequest).toHaveBeenCalled();
  });

  it('does not render fullscreen button if fullscreen feature is unavailable', async () => {
    const user = userEvent.setup();
    const { store } = configureStore({
      initialState: { fullscreen: { supported: false, active: false } },
    });
    renderWithProviders(<LayoutSelection />, { store, provider: { mui: true } });

    await user.click(screen.getByRole('button', { name: 'layout-selection-trigger-button' }));

    expect(screen.queryByRole('menuitemradio', { name: 'layout-selection-fullscreen' })).not.toBeInTheDocument();
  });

  it('renders meeting notes option on mobile when meeting notes are available', async () => {
    const user = userEvent.setup();
    mockUseMediaQuery.mockReturnValue(true);
    const { store } = configureStore({
      initialState: { config: { enabledModules: { [BackendModules.MeetingNotes]: [] } } },
    });

    renderWithProviders(<LayoutSelection />, { store, provider: { snackbar: true, mui: true } });
    await user.click(screen.getByRole('button', { name: 'layout-selection-trigger-button' }));

    expect(mockUseMediaQuery).toHaveBeenCalled();

    const meetingNotesButton = getButtonSelector('moderationbar-button-meeting-notes-tooltip');
    expect(meetingNotesButton).toBeInTheDocument();
  });

  it('does not reset sorting option to first joined when switching view', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LayoutSelection />, { store, provider: { mui: true } });
    await user.click(screen.getByRole('button', { name: 'layout-selection-trigger-button' }));

    const cameraSortingSelect = screen.getByRole('combobox', { name: 'layout-selection-sorting' });
    expect(cameraSortingSelect).toBeInTheDocument();
    //open the sorting options to select camera first sorting
    await user.click(cameraSortingSelect);
    await user.click(screen.getByRole('option', { name: 'layout-selection-grid-camera-first' }));
    //reopen the sorting options to confirm selection
    await user.click(cameraSortingSelect);

    const cameraFirstOption = screen.getByRole('option', { name: 'layout-selection-grid-camera-first' });
    const firstJoinedOption = screen.getByRole('option', { name: 'layout-selection-grid-first-joined' });

    expect(cameraFirstOption).toHaveAttribute('aria-selected', 'true');
    expect(firstJoinedOption).toHaveAttribute('aria-selected', 'false');
    //select camera first again to close the combobox
    await user.click(cameraFirstOption);
    expect(screen.queryByRole('option', { name: 'layout-selection-grid-camera-first' })).not.toBeInTheDocument();

    //switch layout to speaker view
    const speakerViewButton = getButtonSelector('layout-selection-speaker');
    await user.click(speakerViewButton);
    expect(speakerViewButton).toHaveAttribute('aria-pressed', 'true');

    //open combobox again to confirm that camera first sorting is still selected
    await user.click(cameraSortingSelect);
    const updatedCameraFirstOption = screen.getByRole('option', { name: 'layout-selection-grid-camera-first' });
    const updatedFirstJoinedOption = screen.getByRole('option', { name: 'layout-selection-grid-first-joined' });
    expect(updatedCameraFirstOption).toHaveAttribute('aria-selected', 'true');
    expect(updatedFirstJoinedOption).toHaveAttribute('aria-selected', 'false');
  });
});
