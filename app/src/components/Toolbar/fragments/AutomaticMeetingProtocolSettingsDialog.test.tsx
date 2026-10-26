// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TranscriptionLanguageKey, TranscriptionStatus } from '../../../api/types/incoming/transcription';
import { sendStartAutomaticMeetingProtocolSignal } from '../../../api/types/outgoing/transcription';
import * as reduxHooks from '../../../hooks/useCustomRedux';
import { setTranscriptionLanguage, TranscriptionState } from '../../../store/slices/transcriptionSlice';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import AutomaticMeetingProtocolSettingsDialog from './AutomaticMeetingProtocolSettingsDialog';

vi.mock('./TranscriptionLanguageSelect', () => ({
  default: ({
    value,
    disabled,
    hint,
    onChange,
  }: {
    value: TranscriptionLanguageKey | '';
    disabled?: boolean;
    hint?: string;
    onChange: (language: TranscriptionLanguageKey) => void;
  }) => (
    <>
      <button type="button" disabled={disabled} data-value={value} onClick={() => onChange('de')}>
        select-language-de
      </button>
      {hint && <span>{hint}</span>}
    </>
  ),
}));

const mockDispatch = vi.fn();
vi.spyOn(reduxHooks, 'useAppDispatch').mockReturnValue(mockDispatch);

const TRANSCRIPTION_LANGUAGE_STORAGE_KEY = 'transcription-language';

const createState = (overrides: Partial<TranscriptionState> = {}) => ({
  transcription: {
    status: TranscriptionStatus.Inactive,
    liveTranscription: false,
    automaticMeetingProtocol: null,
    showSubtitles: false,
    language: '',
    ...overrides,
  },
});

const renderDialog = (overrides?: Partial<TranscriptionState>) => {
  const onClose = vi.fn();
  const { store } = configureStore({ initialState: createState(overrides) });
  const { rerender } = renderWithProviders(<AutomaticMeetingProtocolSettingsDialog open onClose={onClose} />, {
    store,
    provider: { mui: true },
  });

  return { onClose, rerender, store };
};

const liveTranscriptionRunning: Partial<TranscriptionState> = {
  status: TranscriptionStatus.Running,
  liveTranscription: true,
};

describe('AutomaticMeetingProtocolSettingsDialog', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    localStorage.removeItem(TRANSCRIPTION_LANGUAGE_STORAGE_KEY);
  });

  it('renders the dialog with its controls when open', () => {
    renderDialog();
    expect(screen.getByText('automatic-meeting-protocol-settings-dialog-title')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'global-close-dialog' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'select-language-de' })).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: 'automatic-meeting-protocol-settings-pseudonymization' })
    ).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'global-cancel' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'automatic-meeting-protocol-settings-start-button' })
    ).toBeInTheDocument();
  });

  it('does not render the dialog when its closed', () => {
    const { store } = configureStore({ initialState: createState() });
    renderWithProviders(<AutomaticMeetingProtocolSettingsDialog open={false} />, { store, provider: { mui: true } });
    expect(screen.queryByText('automatic-meeting-protocol-settings-dialog-title')).not.toBeInTheDocument();
  });

  it('renders an empty, enabled language select without a hint when no language is set', () => {
    renderDialog();
    const languageSelect = screen.getByRole('button', { name: 'select-language-de' });
    expect(languageSelect).toHaveAttribute('data-value', '');
    expect(languageSelect).toBeEnabled();
    expect(screen.queryByText('automatic-meeting-protocol-settings-language-locked-hint')).not.toBeInTheDocument();
  });

  it('preselects the current transcription language', () => {
    renderDialog({ language: 'en' });
    expect(screen.getByRole('button', { name: 'select-language-de' })).toHaveAttribute('data-value', 'en');
  });

  it('starts the automatic meeting protocol with the current language and without pseudonymization by default', async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog({ language: 'en' });

    await user.click(screen.getByRole('button', { name: 'automatic-meeting-protocol-settings-start-button' }));
    expect(mockDispatch).toHaveBeenCalledWith(
      sendStartAutomaticMeetingProtocolSignal.action({ pseudonymous: false, language: 'en' })
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables the start button until a language is selected', async () => {
    const user = userEvent.setup();
    renderDialog();
    const startButton = screen.getByRole('button', { name: 'automatic-meeting-protocol-settings-start-button' });
    expect(startButton).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'select-language-de' }));
    expect(startButton).toBeEnabled();
  });

  it('follows store language changes while the user has not picked a language', async () => {
    const { store, rerender, onClose } = renderDialog({ language: 'de' });

    store.dispatch(setTranscriptionLanguage('en'));
    rerender(<AutomaticMeetingProtocolSettingsDialog open onClose={onClose} />);

    expect(await screen.findByRole('button', { name: 'select-language-de' })).toHaveAttribute('data-value', 'en');
  });

  it('resets the draft state after starting the automatic meeting protocol', async () => {
    const user = userEvent.setup();
    const { store, onClose, rerender } = renderDialog({ language: 'de' });

    await user.click(screen.getByRole('button', { name: 'select-language-de' }));
    await user.click(screen.getByRole('switch', { name: 'automatic-meeting-protocol-settings-pseudonymization' }));
    await user.click(screen.getByRole('button', { name: 'automatic-meeting-protocol-settings-start-button' }));

    store.dispatch(setTranscriptionLanguage('en'));
    rerender(<AutomaticMeetingProtocolSettingsDialog open={false} onClose={onClose} />);
    rerender(<AutomaticMeetingProtocolSettingsDialog open onClose={onClose} />);

    expect(screen.getByRole('button', { name: 'select-language-de' })).toHaveAttribute('data-value', 'en');
    expect(
      screen.getByRole('switch', { name: 'automatic-meeting-protocol-settings-pseudonymization' })
    ).not.toBeChecked();
  });

  it('starts the automatic meeting protocol with pseudonymization when the switch is enabled', async () => {
    const user = userEvent.setup();
    renderDialog({ language: 'en' });

    await user.click(screen.getByRole('switch', { name: 'automatic-meeting-protocol-settings-pseudonymization' }));
    expect(screen.getByRole('switch', { name: 'automatic-meeting-protocol-settings-pseudonymization' })).toBeChecked();

    await user.click(screen.getByRole('button', { name: 'automatic-meeting-protocol-settings-start-button' }));
    expect(mockDispatch).toHaveBeenCalledWith(
      sendStartAutomaticMeetingProtocolSignal.action({ pseudonymous: true, language: 'en' })
    );
  });

  it('starts the automatic meeting protocol with the newly selected language and stores it', async () => {
    const user = userEvent.setup();
    renderDialog({ language: 'en' });

    await user.click(screen.getByRole('button', { name: 'select-language-de' }));
    expect(screen.getByRole('button', { name: 'select-language-de' })).toHaveAttribute('data-value', 'de');

    await user.click(screen.getByRole('button', { name: 'automatic-meeting-protocol-settings-start-button' }));

    expect(mockDispatch).toHaveBeenCalledWith(
      sendStartAutomaticMeetingProtocolSignal.action({ pseudonymous: false, language: 'de' })
    );
    expect(localStorage.getItem(TRANSCRIPTION_LANGUAGE_STORAGE_KEY)).toBe('de');
  });

  it('does not store the language when it has not changed', async () => {
    const user = userEvent.setup();
    renderDialog({ language: 'en' });

    await user.click(screen.getByRole('button', { name: 'automatic-meeting-protocol-settings-start-button' }));

    expect(localStorage.getItem(TRANSCRIPTION_LANGUAGE_STORAGE_KEY)).toBeNull();
  });

  describe('when live transcription is running', () => {
    it('locks the language select to the running language and explains why', () => {
      renderDialog({ ...liveTranscriptionRunning, language: 'en' });

      const languageSelect = screen.getByRole('button', { name: 'select-language-de' });
      expect(languageSelect).toHaveAttribute('data-value', 'en');
      expect(languageSelect).toBeDisabled();
      expect(screen.getByText('automatic-meeting-protocol-settings-language-locked-hint')).toBeInTheDocument();
    });

    it('starts the automatic meeting protocol with the live transcription language', async () => {
      const user = userEvent.setup();
      renderDialog({ ...liveTranscriptionRunning, language: 'en' });

      await user.click(screen.getByRole('button', { name: 'automatic-meeting-protocol-settings-start-button' }));

      expect(mockDispatch).toHaveBeenCalledWith(
        sendStartAutomaticMeetingProtocolSignal.action({ pseudonymous: false, language: 'en' })
      );
    });
  });

  it.each([
    { button: 'global-cancel', description: 'the cancel button' },
    { button: 'global-close-dialog', description: 'the close button' },
  ])('closes without starting the automatic meeting protocol when $description is clicked', async ({ button }) => {
    const user = userEvent.setup();
    const { onClose } = renderDialog({ language: 'en' });

    await user.click(screen.getByRole('button', { name: button }));

    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: sendStartAutomaticMeetingProtocolSignal.action.type })
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('resets the draft state when the dialog is cancelled', async () => {
    const user = userEvent.setup();
    const { onClose, rerender } = renderDialog({ language: 'en' });

    await user.click(screen.getByRole('button', { name: 'select-language-de' }));
    await user.click(screen.getByRole('switch', { name: 'automatic-meeting-protocol-settings-pseudonymization' }));
    await user.click(screen.getByRole('button', { name: 'global-cancel' }));

    rerender(<AutomaticMeetingProtocolSettingsDialog open={false} onClose={onClose} />);
    rerender(<AutomaticMeetingProtocolSettingsDialog open onClose={onClose} />);

    expect(screen.getByRole('button', { name: 'select-language-de' })).toHaveAttribute('data-value', 'en');
    expect(
      screen.getByRole('switch', { name: 'automatic-meeting-protocol-settings-pseudonymization' })
    ).not.toBeChecked();
    expect(localStorage.getItem(TRANSCRIPTION_LANGUAGE_STORAGE_KEY)).toBeNull();
  });
});
