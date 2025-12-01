// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { start } from '../../../api/types/outgoing/poll';
import { notifications } from '../../../commonComponents';
import { selectParticipantsTotal } from '../../../store/slices/participantsSlice';
import { PollFormValues, savePollFormValues } from '../../../store/slices/pollSlice';
import { RoomMode } from '../../../types';
import { configureStore, mockedParticipant, renderWithProviders } from '../../../utils/testUtils';
import { Seconds } from '../../../utils/tsUtils';
import CreatePollForm from './CreatePollForm';

vi.mock('../../../commonComponents', async (importOriginal) => ({
  ...(await importOriginal()),
  notifications: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('../../../api/types/outgoing/common', async (importOriginal) => ({
  ...(await importOriginal()),
  sendMessage: vi.fn(),
}));

describe('CreatePollForm', () => {
  const validValues: PollFormValues = {
    topic: 'Test topic',
    duration: 2,
    choices: ['A', 'B'],
    live: true,
    multipleChoice: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows update title when editing an existing poll', () => {
    const { store } = configureStore();

    renderWithProviders(<CreatePollForm initialValues={{ ...validValues, id: 7 }} onClose={vi.fn()} />, {
      store,
      provider: { mui: true },
    });

    expect(screen.getByText('poll-header-title-update')).toBeInTheDocument();
  });

  it('shows an error notification when saving without a topic', async () => {
    const { store, dispatchSpy } = configureStore();
    const onClose = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<CreatePollForm onClose={onClose} />, { store, provider: { mui: true } });

    await user.click(screen.getByRole('button', { name: 'poll-form-button-save' }));

    expect(notifications.error).toHaveBeenCalledExactlyOnceWith('poll-save-form-error');
    expect(onClose).not.toHaveBeenCalled();
    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({ type: savePollFormValues.type }));
  });

  it('saves poll values and closes the form when save is clicked with valid data', async () => {
    const { store, dispatchSpy } = configureStore();
    const onClose = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<CreatePollForm initialValues={validValues} onClose={onClose} />, {
      store,
      provider: { mui: true },
    });

    await user.click(screen.getByRole('button', { name: 'poll-form-button-save' }));

    expect(dispatchSpy).toHaveBeenCalledWith(savePollFormValues(validValues));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(notifications.success).toHaveBeenCalledExactlyOnceWith('poll-save-form-success');
  });

  it('warns instead of submitting when there are fewer than two participants', async () => {
    const { store, dispatchSpy } = configureStore();
    const onClose = vi.fn();

    renderWithProviders(<CreatePollForm initialValues={validValues} onClose={onClose} />, {
      store,
      provider: { mui: true },
    });

    const form = screen.getByTestId('create-poll-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(notifications.warning).toHaveBeenCalledExactlyOnceWith('poll-save-form-warning');
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({ type: start.action.type }));
  });

  it('dispatches start action and closes when submitting with enough participants', async () => {
    const {
      getTrackPublication: _getTrackPublication,
      setMicrophoneEnabled: _setMicrophoneEnabled,
      videoTrackPublications: _videoTrackPublications,
      ...participant
    } = mockedParticipant(0);
    const { store, dispatchSpy } = configureStore({
      initialState: {
        participants: {
          ids: [participant.id],
          entities: { [participant.id]: participant },
        },
      },
    });
    expect(selectParticipantsTotal(store.getState())).toBe(2);
    const onClose = vi.fn();

    renderWithProviders(<CreatePollForm initialValues={validValues} onClose={onClose} />, {
      store,
      provider: { mui: true },
    });

    const form = screen.getByTestId('create-poll-form');
    fireEvent.submit(form);

    const expectedPayload = {
      topic: validValues.topic,
      duration: ((validValues.duration as number) * 60) as Seconds,
      live: validValues.live,
      multipleChoice: validValues.multipleChoice,
      choices: validValues.choices,
    };

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(start.action(expectedPayload));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(notifications.warning).not.toHaveBeenCalled();
  });

  it('disables submit while coffee break mode is active', () => {
    const { store } = configureStore({
      initialState: {
        room: { currentMode: RoomMode.CoffeeBreak },
      },
    });

    renderWithProviders(<CreatePollForm onClose={vi.fn()} />, { store, provider: { mui: true } });

    expect(screen.getByRole('button', { name: 'poll-form-button-submit' })).toBeDisabled();
  });
});
