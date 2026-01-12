// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { AssetId } from '@opentalk/rest-api-rtk-query';

import { notificationAction } from '../../commonComponents';
import { showWithLinkNotification } from '../../components/WithLinkNotification';
import log from '../../logger';
import type { RootState } from '../../store';
import {
  trainingParticipationReportDisabled,
  trainingParticipationReportEnabled,
} from '../../store/slices/moderationSlice';
import { presenceConfirmationDone, presenceConfirmationRequested } from '../../store/slices/roomSlice';
import { composeMeetingDetailsUrl } from '../../utils/apiUtils';
import { TrainingParticipationReportError } from '../types/incoming/trainingParticipationReport';
import type { Message as TrainingParticipationReportMessage } from '../types/incoming/trainingParticipationReport';
import { handleStorageExceededError, showErrorNotification } from './helpers';
import { handleTrainingParticipationReportMessage } from './trainingParticipationReport';

vi.mock('i18next', () => ({
  default: {
    t: vi.fn((key: string) => key),
  },
}));

vi.mock('../../commonComponents', () => ({
  notificationAction: vi.fn(),
}));

vi.mock('../../components/WithLinkNotification', () => ({
  showWithLinkNotification: vi.fn(),
}));

vi.mock('../../utils/apiUtils', () => ({
  composeMeetingDetailsUrl: vi.fn(() => ({ href: 'https://example.test/meetings/event-1' })),
}));

vi.mock('./helpers', () => ({
  handleStorageExceededError: vi.fn(),
  showErrorNotification: vi.fn(),
}));

vi.mock('../../logger', () => ({
  default: {
    error: vi.fn(),
  },
}));

const createState = (overrides: Partial<RootState> = {}) =>
  ({
    config: {
      baseUrl: 'https://example.test',
    },
    room: {
      isOwnedByCurrentUser: true,
      eventInfo: {
        id: 'event-1',
      },
    },
    ...overrides,
  }) as RootState;

describe('handleTrainingParticipationReportMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches enable notification for owners', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: TrainingParticipationReportMessage = { message: 'presence_logging_enabled' };

    handleTrainingParticipationReportMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(trainingParticipationReportEnabled());
    expect(notificationAction).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: 'presence-logging-enabled-notification',
        variant: 'info',
        ariaLive: 'polite',
      })
    );
  });

  it('dispatches disable notification for owners', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: TrainingParticipationReportMessage = { message: 'presence_logging_disabled' };

    handleTrainingParticipationReportMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(trainingParticipationReportDisabled());
    expect(notificationAction).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: 'presence-logging-disabled-notification',
        variant: 'info',
        ariaLive: 'polite',
      })
    );
  });

  it('notifies about logging has started', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: TrainingParticipationReportMessage = { message: 'presence_logging_started' };

    handleTrainingParticipationReportMessage(dispatch, data, state);

    expect(dispatch).not.toHaveBeenCalled();
    expect(notificationAction).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: 'presence-logging-started-notification',
        variant: 'info',
        ariaLive: 'polite',
      })
    );
  });

  it('dispatches confirmation done for participants when logging ends', () => {
    const dispatch = vi.fn();
    const state = createState({ room: { isOwnedByCurrentUser: false } as RootState['room'] });
    const data = {
      message: 'presence_logging_ended',
      reason: 'stopped_manually',
    } as TrainingParticipationReportMessage;

    handleTrainingParticipationReportMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(presenceConfirmationDone());
    expect(notificationAction).not.toHaveBeenCalled();
  });

  it('dispatches confirmation requests', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: TrainingParticipationReportMessage = { message: 'presence_confirmation_requested' };

    handleTrainingParticipationReportMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(presenceConfirmationRequested());
  });

  it('dispatches confirmation done when confirmation is logged', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: TrainingParticipationReportMessage = { message: 'presence_confirmation_logged' };

    handleTrainingParticipationReportMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledWith(presenceConfirmationDone());
  });

  it('notifies about a pdf asset with a meeting link', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: TrainingParticipationReportMessage = {
      message: 'pdf_asset',
      filename: 'report.pdf',
      assetId: 'asset-1' as AssetId,
    };

    handleTrainingParticipationReportMessage(dispatch, data, state);

    expect(composeMeetingDetailsUrl).toHaveBeenCalledExactlyOnceWith(state.config.baseUrl, state.room.eventInfo?.id);
    expect(showWithLinkNotification).toHaveBeenCalledExactlyOnceWith({
      translationKey: 'training-participation-report-pdf-asset-notification',
      url: 'https://example.test/meetings/event-1',
    });
  });

  it('notifies about a pdf asset without a link when event info is missing', () => {
    const dispatch = vi.fn();
    const state = createState({ room: { isOwnedByCurrentUser: true } as RootState['room'] });
    const data: TrainingParticipationReportMessage = {
      message: 'pdf_asset',
      filename: 'report.pdf',
      assetId: 'asset-1' as AssetId,
    };

    handleTrainingParticipationReportMessage(dispatch, data, state);

    expect(composeMeetingDetailsUrl).not.toHaveBeenCalled();
    expect(showWithLinkNotification).toHaveBeenCalledExactlyOnceWith({
      translationKey: 'training-participation-report-pdf-asset-notification',
      url: undefined,
    });
  });

  it('routes storage errors through helpers', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: TrainingParticipationReportMessage = {
      message: 'error',
      error: TrainingParticipationReportError.Storage,
    };

    handleTrainingParticipationReportMessage(dispatch, data, state);

    expect(handleStorageExceededError).toHaveBeenCalledExactlyOnceWith(state, TrainingParticipationReportError.Storage);
    expect(showErrorNotification).toHaveBeenCalledExactlyOnceWith(TrainingParticipationReportError.Storage);
  });

  it('logs unknown message types', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data = { message: 'unknown' } as unknown as TrainingParticipationReportMessage;

    handleTrainingParticipationReportMessage(dispatch, data, state);

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining('Unknown training participation report'));
    expect(dispatch).not.toHaveBeenCalled();
  });
});
