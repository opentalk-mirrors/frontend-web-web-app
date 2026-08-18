// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TranscriptionLanguageKey, TranscriptionStatus } from '../../../api/types/incoming/transcription';
import { TranscriptionLanguage } from '../../../api/types/incoming/transcription';
import * as reduxHooks from '../../../hooks/useCustomRedux';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import SubtitleSettingsDialog from './SubtitleSettingsDialog';

const mockDispatch = vi.fn();

vi.spyOn(reduxHooks, 'useAppDispatch').mockReturnValue(mockDispatch);

const buildInitialState = (language: TranscriptionLanguageKey | null = null) => ({
  transcription: {
    status: TranscriptionStatus.Inactive,
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

  it('dispatches changeTranscriptionLanguageSignal when saving a running transcription service with a new language selected', async () => {
    const { store } = configureStore({
      initialState: {
        transcription: {
          status: TranscriptionStatus.Running,
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
});
