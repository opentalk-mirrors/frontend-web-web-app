// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { kebabCase } from 'lodash';

import { notifications } from '../../commonComponents';
import log from '../../logger';
import * as pollStore from '../../store/slices/pollSlice';
import type { Choice, ChoiceId, ChoiceResult, PollId } from '../../types';
import { Seconds } from '../../utils/tsUtils';
import type { Done, LiveUpdate, Message as PollMessage, Started } from '../types/incoming/poll';
import { PollError } from '../types/incoming/poll';
import { handlePollVoteMessage } from './poll';

vi.mock('i18next', () => ({
  default: {
    t: vi.fn((key: string) => key),
  },
}));
vi.mock('../../logger', () => ({
  default: {
    error: vi.fn(),
  },
}));
vi.mock('../../commonComponents', () => ({
  notifications: {
    error: vi.fn(),
  },
}));

const choiceId = 1 as ChoiceId;

const pollChoices: Choice[] = [
  {
    id: choiceId,
    content: 'Yes',
  },
];

const pollResults: ChoiceResult[] = [
  {
    id: choiceId,
    count: 2,
  },
];

const basePoll = {
  id: 'poll-1' as PollId,
  topic: 'Poll topic',
  live: true,
  multipleChoice: false,
  duration: 60 as Seconds,
  choices: pollChoices,
};

describe('handlePollVoteMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches started messages', () => {
    const dispatch = vi.fn();
    const data: Started = {
      message: 'started',
      ...basePoll,
    };

    handlePollVoteMessage(dispatch, data);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(pollStore.started(data));
  });

  it('dispatches live_update messages', () => {
    const dispatch = vi.fn();
    const data: LiveUpdate = {
      message: 'live_update',
      id: basePoll.id,
      results: pollResults,
    };

    handlePollVoteMessage(dispatch, data);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(pollStore.liveUpdated(data));
  });

  it('dispatches done messages', () => {
    const dispatch = vi.fn();
    const data: Done = {
      message: 'done',
      id: basePoll.id,
      results: pollResults,
    };

    handlePollVoteMessage(dispatch, data);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(pollStore.done(data));
  });

  it.each(Object.values(PollError))('creates notifications for known error cases', (pollError) => {
    const dispatch = vi.fn();
    const data: PollMessage = { message: 'error', error: pollError };
    handlePollVoteMessage(dispatch, data);

    expect(notifications.error).toHaveBeenCalledExactlyOnceWith('poll-error-' + kebabCase(pollError));
  });
  it('logs unknown error cases', () => {
    const dispatch = vi.fn();
    const data: PollMessage = { message: 'error', error: 'unknown_error' as PollError };
    handlePollVoteMessage(dispatch, data);

    expect(notifications.error).not.toHaveBeenCalled();
    expect(log.error).toHaveBeenCalledExactlyOnceWith('Poll error message ', 'unknown_error');
  });

  it('throws on unknown message type', () => {
    const dispatch = vi.fn();
    const data = { message: 'unknown' } as unknown as PollMessage;

    expect(() => handlePollVoteMessage(dispatch, data)).toThrow(/Unknown message type/);
  });
});
