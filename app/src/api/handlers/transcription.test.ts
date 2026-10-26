// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { selectIsAuthenticated } from '@opentalk/redux-oidc';
import { AssetId, EventId } from '@opentalk/rest-api-rtk-query';
import i18next from 'i18next';

import { notifications } from '../../commonComponents';
import { showWithLinkNotification } from '../../components/WithLinkNotification';
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

vi.mock('../../components/WithLinkNotification', () => ({
  showWithLinkNotification: vi.fn(),
}));

vi.mock('@opentalk/redux-oidc', async (importOriginal) => ({
  ...(await importOriginal()),
  selectIsAuthenticated: vi.fn(),
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
  const defaultState = (
    status: TranscriptionStatus = TranscriptionStatus.Inactive,
    overrides: Partial<RootState['transcription']> = {}
  ) =>
    createState({
      transcription: {
        status,
        liveTranscription: true,
        automaticMeetingProtocol: null,
        language: '',
        showSubtitles: false,
        showSettings: false,
        segments: [],
        ...overrides,
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
    it("does not notify when the transcription status is updated to 'inactive'", () => {
      const mockDispatch = vi.fn();
      const message: TranscriptionMessage = {
        message: 'state_updated',
        status: 'inactive' as TranscriptionStatus,
        language: 'en' as TranscriptionLanguageKey,
      };
      handleTranscriptionMessage(mockDispatch, message, defaultState(TranscriptionStatus.Running));

      expect(notifications.info).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'transcription/hideSubtitles' }));
    });
    it('keeps the language when the inactive state carries none', () => {
      const mockDispatch = vi.fn();
      const message: TranscriptionMessage = { message: 'state_updated', status: TranscriptionStatus.Inactive };
      handleTranscriptionMessage(mockDispatch, message, defaultState(TranscriptionStatus.Running));

      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'transcription/setTranscriptionLanguage' })
      );
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
    it('does not offer subtitles when the service only runs for the automatic meeting protocol', () => {
      const mockDispatch = vi.fn();
      const message: TranscriptionMessage = {
        message: 'state_updated',
        status: 'running' as TranscriptionStatus,
        language: 'en' as TranscriptionLanguageKey,
      };
      handleTranscriptionMessage(
        mockDispatch,
        message,
        defaultState(TranscriptionStatus.Requested, { liveTranscription: false })
      );

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'transcription/transcriptionStatusUpdated', payload: 'running' })
      );
      expect(notifications.showTranscriptionEnabledNotification).not.toHaveBeenCalled();
    });
    describe('status stays the same but language changes', () => {
      it('dispatches a notification when the transcription language changes', () => {
        const mockDispatch = vi.fn();
        const stateWithRunningTranscription = defaultState(TranscriptionStatus.Running, { language: 'en' });
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
    describe('automatic meeting protocol', () => {
      const runningMessage: TranscriptionMessage = {
        message: 'state_updated',
        status: TranscriptionStatus.Running,
        language: 'en' as TranscriptionLanguageKey,
      };
      it('notifies that the automatic meeting protocol has started when the service starts running', () => {
        const mockDispatch = vi.fn();
        handleTranscriptionMessage(
          mockDispatch,
          runningMessage,
          defaultState(TranscriptionStatus.Requested, {
            liveTranscription: false,
            automaticMeetingProtocol: { pseudonymous: false, paused: false },
          })
        );
        expect(notifications.info).toHaveBeenCalledWith('automatic-meeting-protocol-notification-started');
        expect(notifications.showTranscriptionEnabledNotification).not.toHaveBeenCalled();
      });
      it('does not notify again when the service was already running', () => {
        const mockDispatch = vi.fn();
        handleTranscriptionMessage(
          mockDispatch,
          runningMessage,
          defaultState(TranscriptionStatus.Running, {
            liveTranscription: false,
            automaticMeetingProtocol: { pseudonymous: false, paused: false },
            language: 'en',
          })
        );
        expect(notifications.info).not.toHaveBeenCalled();
      });
      it('does not notify when the service is not running', () => {
        const mockDispatch = vi.fn();
        const message: TranscriptionMessage = { message: 'state_updated', status: TranscriptionStatus.Inactive };
        handleTranscriptionMessage(
          mockDispatch,
          message,
          defaultState(TranscriptionStatus.Requested, {
            liveTranscription: false,
            automaticMeetingProtocol: { pseudonymous: false, paused: false },
          })
        );
        expect(notifications.info).not.toHaveBeenCalledWith('automatic-meeting-protocol-notification-started');
      });
    });
  });
  describe('modes_updated message received', () => {
    it('stores the received modes', () => {
      const mockDispatch = vi.fn();
      const message: TranscriptionMessage = {
        message: 'modes_updated',
        liveTranscription: false,
        automaticMeetingProtocol: { pseudonymous: true, paused: false },
      };
      handleTranscriptionMessage(mockDispatch, message, defaultState(TranscriptionStatus.Running));

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'transcription/transcriptionModesUpdated',
        payload: { liveTranscription: false, automaticMeetingProtocol: { pseudonymous: true, paused: false } },
      });
    });
    it('hides the subtitles and notifies when live transcription is stopped', () => {
      const mockDispatch = vi.fn();
      const message: TranscriptionMessage = { message: 'modes_updated', liveTranscription: false };
      handleTranscriptionMessage(mockDispatch, message, defaultState(TranscriptionStatus.Running));

      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'transcription/hideSubtitles' }));
      expect(notifications.info).toHaveBeenCalledWith('subtitle-notification-disabled');
    });
    it('offers subtitles when live transcription is started while the service is already running', () => {
      const mockDispatch = vi.fn();
      const message: TranscriptionMessage = {
        message: 'modes_updated',
        liveTranscription: true,
        automaticMeetingProtocol: { pseudonymous: false, paused: false },
      };
      handleTranscriptionMessage(
        mockDispatch,
        message,
        defaultState(TranscriptionStatus.Running, { liveTranscription: false })
      );

      expect(notifications.showTranscriptionEnabledNotification).toHaveBeenCalledWith(
        expect.objectContaining({ onActivated: expect.any(Function) })
      );
    });
    it('waits for the running service before offering subtitles', () => {
      const mockDispatch = vi.fn();
      const message: TranscriptionMessage = { message: 'modes_updated', liveTranscription: true };
      handleTranscriptionMessage(
        mockDispatch,
        message,
        defaultState(TranscriptionStatus.Inactive, { liveTranscription: false })
      );

      expect(notifications.showTranscriptionEnabledNotification).not.toHaveBeenCalled();
    });
    it('notifies that the automatic meeting protocol has started when it is added to the running service', () => {
      const mockDispatch = vi.fn();
      const message: TranscriptionMessage = {
        message: 'modes_updated',
        liveTranscription: true,
        automaticMeetingProtocol: { pseudonymous: false, paused: false },
      };
      handleTranscriptionMessage(mockDispatch, message, defaultState(TranscriptionStatus.Running));

      expect(notifications.info).toHaveBeenCalledWith('automatic-meeting-protocol-notification-started');
      expect(notifications.showTranscriptionEnabledNotification).not.toHaveBeenCalled();
    });
    it('does not notify when the already active automatic meeting protocol only changes its settings', () => {
      const mockDispatch = vi.fn();
      const message: TranscriptionMessage = {
        message: 'modes_updated',
        liveTranscription: true,
        automaticMeetingProtocol: { pseudonymous: false, paused: true },
      };
      handleTranscriptionMessage(
        mockDispatch,
        message,
        defaultState(TranscriptionStatus.Running, { automaticMeetingProtocol: { pseudonymous: false, paused: false } })
      );

      expect(notifications.info).not.toHaveBeenCalled();
    });
    it('notifes that the automatic meeting protocol has stopped', () => {
      const mockDispatch = vi.fn();
      const message: TranscriptionMessage = {
        message: 'modes_updated',
        liveTranscription: true,
      };
      handleTranscriptionMessage(
        mockDispatch,
        message,
        defaultState(TranscriptionStatus.Running, { automaticMeetingProtocol: { pseudonymous: false, paused: false } })
      );

      expect(notifications.info).toHaveBeenCalledWith('automatic-meeting-protocol-notification-stopped');
    });
  });
  describe('pdf_created message received', () => {
    const message: TranscriptionMessage = {
      message: 'pdf_created',
      filename: 'protocol.pdf',
      assetId: 'asset-1' as AssetId,
      quota: { total: 1000, used: 100 },
    };
    const pdfCreatedState = (eventId?: EventId) =>
      createState({
        ...defaultState(TranscriptionStatus.Running, {
          automaticMeetingProtocol: { pseudonymous: false, paused: false },
        }),
        room: { eventInfo: eventId ? { id: eventId } : undefined },
        config: { baseUrl: 'https://example.test' },
      } as unknown as Partial<RootState>);

    it('shows a notification with a link to the meeting details to authenticated users', () => {
      vi.mocked(selectIsAuthenticated).mockReturnValue(true);
      handleTranscriptionMessage(vi.fn(), message, pdfCreatedState('event-1' as EventId));

      expect(showWithLinkNotification).toHaveBeenCalledWith({
        translationKey: 'automatic-meeting-protocol-pdf-created-with-link-notification',
        url: 'https://example.test/dashboard/meetings/event-1',
      });
    });
    it('does not show a notification with a link to the meeting details to non-authenticated users', () => {
      vi.mocked(selectIsAuthenticated).mockReturnValue(false);
      handleTranscriptionMessage(vi.fn(), message, pdfCreatedState('event-1' as EventId));

      expect(showWithLinkNotification).not.toHaveBeenCalled();
      expect(notifications.info).not.toHaveBeenCalled();
    });
  });
  describe('automatic meeting protocol messages received', () => {
    it('accepts automatic_meeting_protocol_consent_updated without side effects', () => {
      const mockDispatch = vi.fn();
      const message: TranscriptionMessage = {
        message: 'automatic_meeting_protocol_consent_updated',
        participant: 'participant-1' as ParticipantId,
        consents: true,
      };

      expect(() => handleTranscriptionMessage(mockDispatch, message, defaultState())).not.toThrow();
      expect(mockDispatch).not.toHaveBeenCalled();
      expect(notifications.info).not.toHaveBeenCalled();
      expect(log.error).not.toHaveBeenCalled();
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
        error: TranscriptionError.ServiceRequestFailed,
      };
      handleTranscriptionMessage(mockDispatch, message, defaultState());
      expect(notifications.error).toHaveBeenCalledWith('transcription-error');
      expect(log.error).toHaveBeenCalledWith('transcription error:', 'service_request_failed');
    });
    it('notifies registered users that transcript generation has failed', () => {
      const mockDispatch = vi.fn();
      const message: TranscriptionMessage = {
        message: 'error',
        error: TranscriptionError.GenerateAutomaticMeetingProtocol,
      };
      vi.mocked(selectIsAuthenticated).mockReturnValue(true);
      handleTranscriptionMessage(mockDispatch, message, defaultState());
      expect(notifications.error).toHaveBeenCalledWith('automatic-meeting-protocol-notification-generate-error');
    });
    it('does not notify guests that transcript generation has failed', () => {
      const mockDispatch = vi.fn();
      const message: TranscriptionMessage = {
        message: 'error',
        error: TranscriptionError.GenerateAutomaticMeetingProtocol,
      };
      vi.mocked(selectIsAuthenticated).mockReturnValue(false);
      handleTranscriptionMessage(mockDispatch, message, defaultState());
      expect(notifications.error).not.toHaveBeenCalled();
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
