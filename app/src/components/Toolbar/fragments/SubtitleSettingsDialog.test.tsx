// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TranscriptionLanguageKey, TranscriptionStatus } from '../../../api/types/incoming/transcription';
import { TranscriptionLanguage } from '../../../api/types/incoming/transcription';
import * as reduxHooks from '../../../hooks/useCustomRedux';
import {
  setTranscriptionLanguage,
  transcriptionModesUpdated,
  TranscriptionState,
  transcriptionStatusUpdated,
} from '../../../store/slices/transcriptionSlice';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import SubtitleSettingsDialog from './SubtitleSettingsDialog';

const mockDispatch = vi.fn();

vi.spyOn(reduxHooks, 'useAppDispatch').mockReturnValue(mockDispatch);

const buildInitialState = (language: TranscriptionLanguageKey | null = null) => ({
  transcription: {
    status: TranscriptionStatus.Inactive,
    liveTranscription: false,
    automaticMeetingProtocol: null,
    showSubtitles: false,
    language,
    segments: [],
  },
});

describe('SubtitleSettingsDialog', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    localStorage.removeItem('transcription-language');
  });

  it('renders SubtitleSettingsDialog component when flag open is true', () => {
    const { store } = configureStore({ initialState: buildInitialState() });
    renderWithProviders(<SubtitleSettingsDialog open />, { store, provider: { mui: true } });

    expect(screen.getByText('subtitle-settings-dialog-title')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'global-close-dialog' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'global-save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'global-cancel' })).toBeInTheDocument();
  });

  it('does not dispatch setTranscriptionLanguage when a language option is selected', async () => {
    const { store } = configureStore({ initialState: buildInitialState() });
    renderWithProviders(<SubtitleSettingsDialog open />, { store, provider: { mui: true } });
    const user = userEvent.setup();

    const enableSubtitlesSwitch = screen.getByRole('switch', { name: 'subtitle-settings-enable-subtitles' });
    await user.click(enableSubtitlesSwitch);

    const languageSelect = screen.getByRole('combobox');
    await user.click(languageSelect);

    const listbox = await screen.findByRole('listbox');
    const options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(Object.keys(TranscriptionLanguage).length);

    await user.click(within(listbox).getByRole('option', { name: 'Deutsch' }));

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('resets the state when the dialog is closed without saving', async () => {
    const { store } = configureStore({ initialState: buildInitialState('en') });
    const { rerender } = renderWithProviders(<SubtitleSettingsDialog open />, { store, provider: { mui: true } });
    const user = userEvent.setup();

    const enableSubtitlesSwitch = screen.getByRole('switch', { name: 'subtitle-settings-enable-subtitles' });
    await user.click(enableSubtitlesSwitch);

    const languageSelect = screen.getByRole('combobox');
    await user.click(languageSelect);

    const listbox = await screen.findByRole('listbox');
    const options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(Object.keys(TranscriptionLanguage).length);

    await user.click(within(listbox).getByRole('option', { name: 'Deutsch' }));
    expect(languageSelect).toHaveTextContent('Deutsch');

    const cancelButton = screen.getByRole('button', { name: 'global-cancel' });
    await user.click(cancelButton);

    rerender(<SubtitleSettingsDialog open={false} />);
    rerender(<SubtitleSettingsDialog open />);

    expect(screen.getByRole('switch', { name: 'subtitle-settings-enable-subtitles' })).not.toBeChecked();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

    await user.click(screen.getByRole('switch', { name: 'subtitle-settings-enable-subtitles' }));
    expect(screen.getByRole('combobox')).toHaveTextContent('English');
  });

  it('shows the language selector only when subtitles are enabled', async () => {
    const { store } = configureStore({ initialState: buildInitialState('en') });
    renderWithProviders(<SubtitleSettingsDialog open />, { store, provider: { mui: true } });
    const user = userEvent.setup();

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

    const enableSubtitlesSwitch = screen.getByRole('switch', { name: 'subtitle-settings-enable-subtitles' });
    await user.click(enableSubtitlesSwitch);
    expect(screen.getByRole('combobox')).toBeInTheDocument();

    await user.click(enableSubtitlesSwitch);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('keeps the selected state when the dialog is saved', async () => {
    const { store } = configureStore({ initialState: buildInitialState('en') });
    const { rerender } = renderWithProviders(<SubtitleSettingsDialog open />, { store, provider: { mui: true } });
    const user = userEvent.setup();

    const enableSubtitlesSwitch = screen.getByRole('switch', { name: 'subtitle-settings-enable-subtitles' });
    await user.click(enableSubtitlesSwitch);

    const languageSelect = screen.getByRole('combobox');
    await user.click(languageSelect);

    const listbox = await screen.findByRole('listbox');
    await user.click(within(listbox).getByRole('option', { name: 'Deutsch' }));

    const saveButton = screen.getByRole('button', { name: 'global-save' });
    await user.click(saveButton);
    rerender(<SubtitleSettingsDialog open={false} />);

    // simulate the backend confirming the started live transcription
    store.dispatch(setTranscriptionLanguage('de'));
    store.dispatch(transcriptionStatusUpdated(TranscriptionStatus.Running));
    store.dispatch(transcriptionModesUpdated({ liveTranscription: true }));
    rerender(<SubtitleSettingsDialog open />);

    expect(screen.getByRole('switch', { name: 'subtitle-settings-enable-subtitles' })).toBeChecked();
    expect(screen.getByRole('combobox')).toHaveTextContent('Deutsch');
  });

  it('dispatches changeTranscriptionLanguageSignal when saving a running transcription service with a new language selected', async () => {
    const { store } = configureStore({
      initialState: {
        transcription: {
          status: TranscriptionStatus.Running,
          liveTranscription: true,
          automaticMeetingProtocol: null,
          showSubtitles: false,
          language: 'en',
          segments: [],
        },
      },
    });
    renderWithProviders(<SubtitleSettingsDialog open />, { store, provider: { mui: true } });
    const user = userEvent.setup();

    const languageSelect = screen.getByRole('combobox');
    await user.click(languageSelect);

    const listbox = await screen.findByRole('listbox');
    const options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(Object.keys(TranscriptionLanguage).length);

    await user.click(within(listbox).getByRole('option', { name: 'Deutsch' }));

    const saveButton = screen.getByRole('button', { name: 'global-save' });
    expect(saveButton).toBeEnabled();
    await user.click(saveButton);

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'signaling/transcription/change_language',
        payload: expect.objectContaining({ language: 'de' }),
      })
    );
  });

  it('starts live transcription when the service only runs for the automatic meeting protocol', async () => {
    const { store } = configureStore({
      initialState: {
        transcription: {
          status: TranscriptionStatus.Running,
          liveTranscription: false,
          automaticMeetingProtocol: { pseudonymous: false, paused: false },
          showSubtitles: false,
          language: 'en',
          segments: [],
        },
      },
    });
    renderWithProviders(<SubtitleSettingsDialog open />, { store, provider: { mui: true } });
    const user = userEvent.setup();

    const enableSubtitlesSwitch = screen.getByRole('switch', { name: 'subtitle-settings-enable-subtitles' });
    expect(enableSubtitlesSwitch).not.toBeChecked();
    await user.click(enableSubtitlesSwitch);
    await user.click(screen.getByRole('button', { name: 'global-save' }));

    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'signaling/transcription/start' }));
  });

  it('dispatches start transcription action with correct language when saving with enabled transcription', async () => {
    const { store } = configureStore({ initialState: buildInitialState('en') });
    renderWithProviders(<SubtitleSettingsDialog open />, { store, provider: { mui: true } });
    const user = userEvent.setup();

    const enableSubtitlesSwitch = screen.getByRole('switch', { name: 'subtitle-settings-enable-subtitles' });
    await user.click(enableSubtitlesSwitch);

    const saveButton = screen.getByRole('button', { name: 'global-save' });
    expect(saveButton).toBeEnabled();
    await user.click(saveButton);

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'signaling/transcription/start',
        payload: expect.objectContaining({ language: 'en' }),
      })
    );
  });

  describe('language interlocking with the automatic meeting protocol', () => {
    const createRunningTranscriptionState = (overrides: Partial<TranscriptionState>) => ({
      transcription: {
        status: TranscriptionStatus.Running,
        liveTranscription: false,
        automaticMeetingProtocol: null,
        showSubtitles: false,
        language: 'en' as TranscriptionLanguageKey,
        segments: [],
        ...overrides,
      },
    });
    const automaticMeetingProtocolRunning: Partial<TranscriptionState> = {
      automaticMeetingProtocol: { pseudonymous: false, paused: false },
    };
    const liveTranscriptionRunning: Partial<TranscriptionState> = { liveTranscription: true };

    it('locks the language select if the automatic meeting protocol is running', async () => {
      const { store } = configureStore({
        initialState: createRunningTranscriptionState(automaticMeetingProtocolRunning),
      });
      renderWithProviders(<SubtitleSettingsDialog open />, { store, provider: { mui: true } });
      const user = userEvent.setup();

      await user.click(screen.getByRole('switch', { name: 'subtitle-settings-enable-subtitles' }));

      const languageSelect = screen.getByRole('combobox');
      expect(languageSelect).toHaveAttribute('aria-disabled', 'true');
      expect(languageSelect).toHaveTextContent('English');
      expect(languageSelect).toHaveAccessibleDescription('subtitle-settings-language-locked-hint');
    });

    it('shows the current transcription language after the automatic meeting protocol stops', async () => {
      const { store } = configureStore({ initialState: buildInitialState('de') });
      const { rerender } = renderWithProviders(<SubtitleSettingsDialog open />, { store, provider: { mui: true } });
      const user = userEvent.setup();

      store.dispatch(setTranscriptionLanguage('en'));
      store.dispatch(transcriptionStatusUpdated(TranscriptionStatus.Running));
      store.dispatch(
        transcriptionModesUpdated({
          liveTranscription: true,
          automaticMeetingProtocol: { pseudonymous: false, paused: false },
        })
      );
      rerender(<SubtitleSettingsDialog open={false} />);
      rerender(<SubtitleSettingsDialog open />);
      expect(screen.getByRole('combobox')).toHaveTextContent('English');

      await user.click(screen.getByRole('button', { name: 'global-cancel' }));
      rerender(<SubtitleSettingsDialog open={false} />);

      store.dispatch(transcriptionModesUpdated({ liveTranscription: true }));
      rerender(<SubtitleSettingsDialog open />);

      const languageSelect = screen.getByRole('combobox');
      expect(languageSelect).not.toHaveAttribute('aria-disabled');
      expect(languageSelect).toHaveTextContent('English');
    });

    it('does not lock the language select when only live transcription is running', () => {
      const { store } = configureStore({ initialState: createRunningTranscriptionState(liveTranscriptionRunning) });
      renderWithProviders(<SubtitleSettingsDialog open />, { store, provider: { mui: true } });

      const languageSelect = screen.getByRole('combobox');
      expect(languageSelect).not.toHaveAttribute('aria-disabled');
      expect(screen.queryByText('subtitle-settings-language-locked-hint')).not.toBeInTheDocument();
    });
  });
});
