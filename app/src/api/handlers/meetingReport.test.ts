// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { AssetId } from '@opentalk/rest-api-rtk-query';

import { showWithLinkNotification } from '../../components/WithLinkNotification';
import type { RootState } from '../../store';
import { composeMeetingDetailsUrl } from '../../utils/apiUtils';
import { MeetingReportError } from '../types/incoming/meetingReport';
import type { Message as MeetingReportMessage } from '../types/incoming/meetingReport';
import { handleStorageExceededError } from './helpers';
import { handleMeetingReportMessage } from './meetingReport';

vi.mock('../../components/WithLinkNotification', () => ({
  showWithLinkNotification: vi.fn(),
}));

vi.mock('../../utils/apiUtils', () => ({
  composeMeetingDetailsUrl: vi.fn(() => ({ href: 'https://example.test/meetings/event-1' })),
}));

vi.mock('./helpers', () => ({
  handleStorageExceededError: vi.fn(),
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
      eventInfo: {
        id: 'event-1',
      },
    },
    ...overrides,
  }) as RootState;

describe('handleMeetingReportMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('notifies with the meeting report link when event info is available', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: MeetingReportMessage = {
      message: 'pdf_asset',
      filename: 'report.pdf',
      assetId: 'asset-1' as AssetId,
    };

    handleMeetingReportMessage(dispatch, data, state);

    expect(composeMeetingDetailsUrl).toHaveBeenCalledExactlyOnceWith(state.config.baseUrl, state.room.eventInfo?.id);
    expect(showWithLinkNotification).toHaveBeenCalledExactlyOnceWith({
      translationKey: 'meeting-report-pdf-asset-message',
      url: 'https://example.test/meetings/event-1',
    });
  });

  it('notifies without a link when event info is missing', () => {
    const dispatch = vi.fn();
    const state = createState({ room: {} as RootState['room'] });
    const data: MeetingReportMessage = {
      message: 'pdf_asset',
      filename: 'report.pdf',
      assetId: 'asset-1' as AssetId,
    };

    handleMeetingReportMessage(dispatch, data, state);

    expect(composeMeetingDetailsUrl).not.toHaveBeenCalled();
    expect(showWithLinkNotification).toHaveBeenCalledExactlyOnceWith({
      translationKey: 'meeting-report-pdf-asset-message',
      url: undefined,
    });
  });

  it('routes storage errors through the helper', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: MeetingReportMessage = { message: 'error', error: MeetingReportError.StorageExceeded };

    handleMeetingReportMessage(dispatch, data, state);

    expect(handleStorageExceededError).toHaveBeenCalledExactlyOnceWith(state, MeetingReportError.StorageExceeded);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('throws on unknown message type', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data = { message: 'unknown' } as unknown as MeetingReportMessage;

    expect(() => handleMeetingReportMessage(dispatch, data, state)).toThrow(/Unknown message type/);
  });
});
