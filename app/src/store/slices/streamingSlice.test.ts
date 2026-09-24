// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { StreamingStatus } from '@opentalk/rest-api-rtk-query';

import { sendStartRecordingSignal } from '../../api/types/outgoing/streaming';
import { configureStore } from '../../utils/testUtils';
import { hangUp } from '../commonActions';
import reducer, {
  recordingStatusUpdated,
  selectIsStartRecordingRequested,
  startRecordingFailed,
  startRecordingRequestTimedOut,
} from './streamingSlice';

vi.mock('../../modules/WebRTC/ConferenceRoom', async (importOriginal) => ({
  ...(await importOriginal()),
  getCurrentConferenceRoom: () => ({
    sendMessage: vi.fn(),
  }),
}));

const getInitialState = () => reducer(undefined, { type: '@@INIT' });

describe('streamingSlice start recording request', () => {
  it('flags a start recording request when the start recording signal is sent', () => {
    const state = reducer(getInitialState(), sendStartRecordingSignal.action());

    expect(state.isStartRecordingRequested).toBe(true);
  });

  it.each([
    ['a recording status update', recordingStatusUpdated(StreamingStatus.Requested)],
    ['a timeout', startRecordingRequestTimedOut()],
    ['a failed start', startRecordingFailed()],
    ['hanging up', { type: hangUp.pending.type }],
  ])('clears the start recording request on %s', (_, action) => {
    const state = reducer({ ...getInitialState(), isStartRecordingRequested: true }, action);

    expect(state.isStartRecordingRequested).toBe(false);
  });

  describe('timeout listener', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('clears the start recording request if the backend does not answer within 10 seconds', async () => {
      const { store } = configureStore();

      store.dispatch(sendStartRecordingSignal.action());
      await vi.advanceTimersByTimeAsync(9_999);
      expect(selectIsStartRecordingRequested(store.getState())).toBe(true);

      await vi.advanceTimersByTimeAsync(1);
      expect(selectIsStartRecordingRequested(store.getState())).toBe(false);
    });
  });
});
