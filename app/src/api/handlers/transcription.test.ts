// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';

import { notifications } from '../../commonComponents';
import log from '../../logger';
import { RootState } from '../../store';
import { ParticipantId, Timestamp } from '../../types';
import { TranscriptionLanguageKey } from '../types/incoming/transcription';
import { TranscriptionStatus, TranscriptionMessage, TranscriptionError } from '../types/incoming/transcription';
import { handleTranscriptionMessage } from './transcription';

vi.mock('i18next', () => ({
  default: {
    t: vi.fn((key: string) => key),
  },
}));
vi.mock('../../i18n', () => ({
  default: {
    t: vi.fn(),
    changeLanguage: vi.fn(),
  },
}));
vi.mock('../../commonComponents', () => ({
  notifications: { info: vi.fn(), error: vi.fn(), showTranscriptionEnabledNotification: vi.fn() },
}));

vi.mock('../../logger', () => ({
  default: {
    error: vi.fn(),
  },
}));

export const transcriptionSegments: TranscriptionMessage[] = [
  {
    message: 'segment',
    participantId: 'participant-1' as ParticipantId,
    trackId: 'track-1',
    startsAt: '2023-01-01T00:00:00.000Z' as Timestamp,
    endsAt: '2023-01-01T00:00:05.000Z' as Timestamp,
    text: 'Hello, this is a test segment.',
  },
  {
    message: 'segment',
    participantId: 'participant-2' as ParticipantId,
    trackId: 'track-2',
    startsAt: '2023-01-01T00:00:05.000Z' as Timestamp,
    endsAt: '2023-01-01T00:00:10.000Z' as Timestamp,
    text: 'This is another test segment.',
  },
];
const createState = (overrides: Partial<RootState> = {}) =>
  ({
    ...overrides,
  }) as RootState;

describe('handleTranscriptionMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  const defaultState = (status: TranscriptionStatus = TranscriptionStatus.Inactive) =>
    createState({
      transcription: {
        status,
        language: '',
        showSubtitles: false,
        showSettings: false,
        segments: [],
      },
    });
  describe('state_updated message received', () => {
    it('dispatches transcriptionStatusUpdated and setTranscriptionLanguage', () => {
      const mockDispatch = vi.fn();
      const message: TranscriptionMessage = {
        message: 'state_updated',
        status: 'running' as TranscriptionStatus,
        language: 'en' as TranscriptionLanguageKey,
      };
      handleTranscriptionMessage(mockDispatch, message, defaultState());
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'transcription/transcriptionStatusUpdated', payload: 'running' })
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'transcription/setTranscriptionLanguage', payload: 'en' })
      );
    });
    it("dispatches a notification when the transcription status is updated to 'inactive'", () => {
      const mockDispatch = vi.fn();
      const message: TranscriptionMessage = {
        message: 'state_updated',
        status: 'inactive' as TranscriptionStatus,
        language: 'en' as TranscriptionLanguageKey,
      };
      handleTranscriptionMessage(mockDispatch, message, defaultState(TranscriptionStatus.Running));

      expect(i18next.t).toHaveBeenCalledWith('subtitle-notification-disabled');
      expect(notifications.info).toHaveBeenCalledWith('subtitle-notification-disabled');
    });
    it("turns subtitles off when the transcription status is updated to 'inactive'", () => {
      const mockDispatch = vi.fn();
      const message: TranscriptionMessage = {
        message: 'state_updated',
        status: 'inactive' as TranscriptionStatus,
        language: 'en' as TranscriptionLanguageKey,
      };
      handleTranscriptionMessage(mockDispatch, message, defaultState(TranscriptionStatus.Running));
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'transcription/hideSubtitles' }));
    });
    it("dispatches a notification when the transcription status is updated to 'running'", () => {
      const mockDispatch = vi.fn();
      const message: TranscriptionMessage = {
        message: 'state_updated',
        status: 'running' as TranscriptionStatus,
        language: 'en' as TranscriptionLanguageKey,
      };
      handleTranscriptionMessage(mockDispatch, message, defaultState());
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'transcription/transcriptionStatusUpdated', payload: 'running' })
      );
      expect(notifications.showTranscriptionEnabledNotification).toHaveBeenCalledWith(
        expect.objectContaining({ onActivated: expect.any(Function) })
      );
    });
    describe('status stays the same but language changes', () => {
      it('dispatches a notification when the transcription language changes', () => {
        const mockDispatch = vi.fn();
        const stateWithRunningTranscription = createState({
          transcription: {
            status: TranscriptionStatus.Running,
            language: 'en' as TranscriptionLanguageKey,
            showSubtitles: false,
            showSettings: false,
            segments: [],
          },
        });
        const message: TranscriptionMessage = {
          message: 'state_updated',
          status: 'running' as TranscriptionStatus,
          language: 'de' as TranscriptionLanguageKey,
        };
        handleTranscriptionMessage(mockDispatch, message, stateWithRunningTranscription);
        expect(i18next.t).toHaveBeenCalledWith('subtitle-notification-language-changed', { language: 'Deutsch' });
        expect(mockDispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'transcription/setTranscriptionLanguage', payload: 'de' })
        );
        expect(notifications.info).toHaveBeenCalledWith('subtitle-notification-language-changed');
      });
    });
  });
  describe('segment message received', () => {
    it("stores a segment when a 'segment' message is received", () => {
      const mockDispatch = vi.fn();
      const message: TranscriptionMessage = transcriptionSegments[0];
      handleTranscriptionMessage(mockDispatch, message, defaultState());
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'transcription/segmentReceived', payload: message })
      );
    });
  });
  describe('error message received', () => {
    it("dispatches a notification when an 'error' message is received", () => {
      const mockDispatch = vi.fn();
      const message: TranscriptionMessage = {
        message: 'error',
        error: 'service_request_failed' as TranscriptionError,
      };
      handleTranscriptionMessage(mockDispatch, message, defaultState());
      expect(notifications.error).toHaveBeenCalledWith('transcription-error');
      expect(log.error).toHaveBeenCalledWith('transcription error:', 'service_request_failed');
    });
    it('logs unknown message types and throws an error', () => {
      const mockDispatch = vi.fn();
      const message: TranscriptionMessage = {
        message: 'unknown_message_type',
      } as unknown as TranscriptionMessage;
      expect(() => handleTranscriptionMessage(mockDispatch, message, defaultState())).toThrow();
      expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Unknown transcription message type:'));
    });
  });
});
