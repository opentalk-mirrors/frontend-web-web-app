// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TranscriptionStatus } from '../../api/types/incoming/transcription';
import * as reduxHooks from '../../hooks/useCustomRedux';
import { removeExpiredSegments } from '../../store/slices/transcriptionSlice';
import { Role, Timestamp } from '../../types';
import { configureStore, mockedParticipant, renderWithProviders } from '../../utils/testUtils';
import TranscriptionSubtitlesDisplay from './TranscriptionSubtitlesDisplay';

describe('TranscriptionSubtitlesDisplay', () => {
  const participant1 = mockedParticipant(0);
  const participant2 = mockedParticipant(1);
  const startDate = new Date('2024-06-01T00:00:00Z');

  describe('user is not a moderator', () => {
    const initialState = {
      transcription: {
        status: TranscriptionStatus.Running,
        showSubtitles: true,
        segments: [
          {
            participantId: participant1.id,
            text: 'Hello world',
            endsAt: startDate.toISOString() as Timestamp,
          },
        ],
      },
      participants: {
        ids: [participant1.id, participant2.id],
        entities: { [participant1.id]: participant1, [participant2.id]: participant2 },
      },
    };

    it('displays the participant name and subtitles', () => {
      const { store } = configureStore({ initialState });
      renderWithProviders(<TranscriptionSubtitlesDisplay />, { store, provider: { mui: true } });
      expect(screen.getByText(/Hello world/)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(participant1.displayName, 'i'))).toBeInTheDocument();
    });

    it('periodically attempts to remove expired segments', () => {
      const mockDispatch = vi.fn();

      vi.spyOn(reduxHooks, 'useAppDispatch').mockReturnValue(mockDispatch);
      vi.useFakeTimers();
      const { store } = configureStore({ initialState });
      renderWithProviders(<TranscriptionSubtitlesDisplay />, { store, provider: { mui: true } });

      expect(mockDispatch).not.toHaveBeenCalledWith(removeExpiredSegments(new Date().toISOString()));

      vi.advanceTimersByTime(1000);

      expect(mockDispatch).toHaveBeenCalledWith(removeExpiredSegments(new Date().toISOString()));

      vi.useRealTimers();
    });

    it('shows a placeholder when there are no subtitles to display', () => {
      const { store } = configureStore({
        initialState: { ...initialState, transcription: { ...initialState.transcription, segments: [] } },
      });
      renderWithProviders(<TranscriptionSubtitlesDisplay />, { store, provider: { mui: true } });
      expect(screen.getByText('subtitle-silence-placeholder')).toBeInTheDocument();
    });

    it('does not show a settings button', () => {
      const { store } = configureStore({
        initialState: {
          ...initialState,
        },
      });
      renderWithProviders(<TranscriptionSubtitlesDisplay />, { store, provider: { mui: true } });
      expect(screen.queryByRole('button', { name: 'more-menu-subtitle-settings' })).not.toBeInTheDocument();
    });
    it('shows a close button', () => {
      const { store } = configureStore({
        initialState: {
          ...initialState,
        },
      });
      renderWithProviders(<TranscriptionSubtitlesDisplay />, { store, provider: { mui: true } });
      expect(screen.getByRole('button', { name: 'more-menu-hide-subtitles' })).toBeInTheDocument();
    });
    it('dispatches hideSubtitles when close button is clicked', async () => {
      const mockDispatch = vi.fn();
      vi.spyOn(reduxHooks, 'useAppDispatch').mockReturnValue(mockDispatch);

      const user = userEvent.setup();
      const { store } = configureStore({
        initialState: {
          ...initialState,
        },
      });
      renderWithProviders(<TranscriptionSubtitlesDisplay />, { store, provider: { mui: true } });

      const closeButton = screen.getByRole('button', { name: 'more-menu-hide-subtitles' });
      await user.click(closeButton);

      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'transcription/hideSubtitles' }));
    });
  });
  describe('user is moderator', () => {
    const initialState = {
      user: { role: Role.Moderator },
      room: { isOwnedByCurrentUser: true },
      transcription: {
        status: TranscriptionStatus.Running,
        showSubtitles: true,
        segments: [
          {
            participantId: participant1.id,
            text: 'Hello world',
            endsAt: startDate.toISOString() as Timestamp,
          },
        ],
      },
      participants: {
        ids: [participant1.id, participant2.id],
        entities: { [participant1.id]: participant1, [participant2.id]: participant2 },
      },
    };

    it('shows a settings button', () => {
      const { store } = configureStore({
        initialState,
      });
      renderWithProviders(<TranscriptionSubtitlesDisplay />, { store, provider: { mui: true } });

      const settingsButton = screen.getByRole('button', { name: 'more-menu-subtitle-settings' });
      expect(settingsButton).toBeInTheDocument();
    });

    it('dispatches showTranscriptionSettings when settings button is clicked', async () => {
      const mockDispatch = vi.fn();
      vi.spyOn(reduxHooks, 'useAppDispatch').mockReturnValue(mockDispatch);

      const user = userEvent.setup();
      const { store } = configureStore({
        initialState,
      });
      renderWithProviders(<TranscriptionSubtitlesDisplay />, { store, provider: { mui: true } });

      const settingsButton = screen.getByRole('button', { name: 'more-menu-subtitle-settings' });
      await user.click(settingsButton);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'transcription/showTranscriptionSettings' })
      );
    });
  });
});
