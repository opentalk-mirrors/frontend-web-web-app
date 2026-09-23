// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipants } from '@livekit/components-react';
import { screen, waitFor } from '@testing-library/react';
import { Mock } from 'vitest';

import LayoutOptions from '../../../enums/LayoutOptions';
import useConferenceUiVersion from '../../../hooks/useConferenceUiVersion';
import { fullscreenActions } from '../../../store/slices/fullscreen/slice';
import { setLivekitUnavailable } from '../../../store/slices/livekitSlice';
import { actions as uiActions } from '../../../store/slices/uiSlice';
import { configureStore, mockedParticipant, renderWithProviders } from '../../../utils/testUtils';
import Cinema from './Cinema';

vi.mock('../../../hooks/useConferenceUiVersion', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('./SelfView', () => ({
  __esModule: true,
  default: () => <div data-testid="self-view" />,
}));

vi.mock('../../FullscreenView', () => ({
  __esModule: true,
  default: () => <div data-testid="fullscreen-view" />,
}));

vi.mock('../../GridView', () => ({
  __esModule: true,
  default: () => <div data-testid="grid-view" />,
}));

vi.mock('../../SpeakerView', () => ({
  __esModule: true,
  default: () => <div data-testid="speaker-view" />,
}));

vi.mock('../../WhiteboardView', () => ({
  __esModule: true,
  default: () => <div data-testid="whiteboard-view" />,
}));

vi.mock('../../MeetingNotesView', () => ({
  __esModule: true,
  default: () => <div data-testid="meeting-notes-view" />,
}));

vi.mock('./MediaReconnectionDialog', () => ({
  __esModule: true,
  default: () => <div data-testid="media-reconnection-dialog" />,
}));
vi.mock('@livekit/components-react', () => ({
  useRemoteParticipants: vi.fn(),
}));

describe('Cinema', () => {
  beforeEach(() => {
    (useRemoteParticipants as Mock).mockReturnValue(
      Array.from({ length: 6 }, (_, index) => ({
        ...mockedParticipant(index),
      }))
    );
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders self view if V2 ui is selected', () => {
    const { store } = configureStore();
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: true });
    renderWithProviders(<Cinema />, { store, provider: { mui: true } });
    expect(screen.getByTestId('self-view')).toBeInTheDocument();
  });

  it('does not render self view if V1 ui is selected', () => {
    const { store } = configureStore();
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: false });
    renderWithProviders(<Cinema />, { store, provider: { mui: true } });
    expect(screen.queryByTestId('self-view')).not.toBeInTheDocument();
  });

  it('dispatches fullscreen element on mount and clears it on unmount', async () => {
    const { store, dispatchSpy } = configureStore();
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: true });
    const { unmount } = renderWithProviders(<Cinema />, { store, provider: { mui: true } });

    await waitFor(() => {
      const setElementCall = dispatchSpy.mock.calls.find(([action]) => {
        const typedAction = action as ReturnType<typeof fullscreenActions.setElement>;
        return typedAction.type === fullscreenActions.setElement.type && Boolean(typedAction.payload?.element);
      })?.[0] as ReturnType<typeof fullscreenActions.setElement> | undefined;

      expect(setElementCall?.payload?.element).toBeInstanceOf(HTMLElement);
    });

    dispatchSpy.mockClear();

    unmount();

    expect(dispatchSpy).toHaveBeenCalledWith(fullscreenActions.setElement({ element: undefined }));
  });

  it('renders fullscreen view when fullscreen mode is active regardless of layout', () => {
    const { store } = configureStore();
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: true });
    store.dispatch(uiActions.updatedCinemaLayout({ layout: LayoutOptions.Speaker }));
    store.dispatch(fullscreenActions.changed({ active: true }));

    renderWithProviders(<Cinema />, { store, provider: { mui: true } });

    expect(screen.getByTestId('fullscreen-view')).toBeInTheDocument();
    expect(screen.queryByTestId('speaker-view')).not.toBeInTheDocument();
  });

  it('renders media reconnection dialog when livekit is unavailable', () => {
    const { store } = configureStore({
      initialState: {
        config: {
          spacedeck: {
            enabled: false,
          },
        },
      },
    });
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: true });
    store.dispatch(setLivekitUnavailable(true));

    renderWithProviders(<Cinema />, { store, provider: { mui: true } });

    expect(screen.getByTestId('media-reconnection-dialog')).toBeInTheDocument();
  });

  it.each([
    { layout: LayoutOptions.Speaker, expectedTestId: 'speaker-view' },
    { layout: LayoutOptions.Whiteboard, expectedTestId: 'whiteboard-view' },
    { layout: LayoutOptions.MeetingNotes, expectedTestId: 'meeting-notes-view' },
    { layout: LayoutOptions.Grid, expectedTestId: 'grid-view' },
  ])('renders correct layout for $layout option', ({ layout, expectedTestId }) => {
    const { store } = configureStore();
    store.dispatch(fullscreenActions.changed({ active: false }));
    store.dispatch(uiActions.updatedCinemaLayout({ layout }));

    renderWithProviders(<Cinema />, { store, provider: { mui: true } });

    expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
  });
});
