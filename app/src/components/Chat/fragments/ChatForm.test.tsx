// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { sendChatMessage } from '../../../api/types/outgoing/chat';
import { setChatSettings } from '../../../store/slices/chatSlice';
import { saveDefaultChatMessage } from '../../../store/slices/uiSlice';
import { ChatScope, ParticipantId, Timestamp } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import ChatForm from './ChatForm';

vi.mock('emoji-picker-react', () => {
  const Categories = {
    RECENT: 'RECENT',
    SUGGESTED: 'SUGGESTED',
    SMILEYS_PEOPLE: 'SMILEYS_PEOPLE',
  };

  const MockPicker = ({ onEmojiClick }: { onEmojiClick: (data: { emoji: string }) => void }) => (
    <button type="button" data-testid="emoji-picker" onClick={() => onEmojiClick({ emoji: '😀' })}>
      emoji-picker
    </button>
  );

  return {
    __esModule: true,
    default: MockPicker,
    EmojiStyle: { NATIVE: 'NATIVE' },
    Theme: { DARK: 'DARK' },
    SkinTonePickerLocation: { SEARCH: 'SEARCH' },
    SkinTones: { MEDIUM_LIGHT: 'MEDIUM_LIGHT' },
    SuggestionMode: { RECENT: 'RECENT' },
    Categories,
  };
});

vi.mock('../../../api/types/outgoing/common', () => ({
  sendMessage: vi.fn(),
}));

describe('ChatForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sends a global message when the submit button is clicked', async () => {
    const user = userEvent.setup();
    const { store, dispatchSpy } = configureStore();

    renderWithProviders(<ChatForm />, { store, provider: { mui: true } });

    const input = screen.getByLabelText('chat-input-label');
    await user.type(input, 'Hello world');

    await user.click(screen.getByTestId('send-message-button'));

    await waitFor(() =>
      expect(dispatchSpy).toHaveBeenCalledWith(
        sendChatMessage.action({ scope: ChatScope.Global, content: 'Hello world' })
      )
    );
    expect(dispatchSpy).toHaveBeenCalledWith(
      saveDefaultChatMessage({ scope: ChatScope.Global, targetId: undefined, input: '' })
    );
    expect(input).toHaveValue('');
  });

  it('submits a private message when Enter is pressed without modifiers', async () => {
    const user = userEvent.setup();
    const targetId = 'participant-42' as ParticipantId;
    const { store, dispatchSpy } = configureStore({
      initialState: {
        ui: {
          chatConversationState: {
            scope: ChatScope.Private,
            targetId,
          },
          chatAutosavedInputs: {
            [ChatScope.Private]: {
              [targetId]: '',
            },
          },
        },
      },
    });

    renderWithProviders(<ChatForm />, { store, provider: { mui: true } });

    const input = screen.getByLabelText('chat-input-label');
    await user.type(input, 'Secret message');

    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        sendChatMessage.action({ scope: ChatScope.Private, content: 'Secret message', target: targetId })
      );
    });
  });

  it('appends emoji selections to the message and stores the draft', async () => {
    const user = userEvent.setup();
    const { store, dispatchSpy } = configureStore();

    renderWithProviders(<ChatForm />, { store, provider: { mui: true } });

    const input = screen.getByLabelText('chat-input-label');
    await user.type(input, 'Hello');

    await user.click(screen.getByRole('button', { name: 'chat-open-emoji-picker' }));
    const pickerButton = await screen.findByTestId('emoji-picker');
    await user.click(pickerButton);

    expect(input).toHaveValue('Hello😀');
    expect(dispatchSpy).toHaveBeenCalledWith(
      saveDefaultChatMessage({ scope: ChatScope.Global, targetId: undefined, input: 'Hello😀' })
    );
  });

  it('disables the form controls when chat is disabled', () => {
    const timestamp = new Date().toISOString() as Timestamp;
    const { store } = configureStore();

    store.dispatch(setChatSettings({ id: 'user-1' as ParticipantId, timestamp, enabled: false }));

    renderWithProviders(<ChatForm />, { store, provider: { mui: true } });

    const input = screen.getByLabelText('chat-input-label');
    const emojiButton = screen.getByRole('button', { name: 'chat-open-emoji-picker' });
    const sendButton = screen.getByTestId('send-message-button');

    expect(input).toHaveAttribute('readonly');
    expect(emojiButton).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });
});
