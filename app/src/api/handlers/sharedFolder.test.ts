// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import log from '../../logger';
import { sharedFolderUpdated } from '../../store/slices/sharedFolderSlice';
import type { Message as SharedFolderMessage } from '../types/incoming/sharedFolder';
import { handleSharedFolderMessage } from './sharedFolder';

vi.mock('../../logger', () => ({
  default: {
    error: vi.fn(),
  },
}));

describe('handleSharedFolderMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches updates to the shared folder slice', () => {
    const dispatch = vi.fn();
    const data: SharedFolderMessage = { message: 'updated', read: 'https://read.example', readWrite: 'rw-token' };

    handleSharedFolderMessage(dispatch, data);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(
      sharedFolderUpdated({ read: data.read, readWrite: data.readWrite })
    );
  });

  it('throws on unknown message types', () => {
    const dispatch = vi.fn();
    const data = { message: 'unknown' } as unknown as SharedFolderMessage;

    expect(() => handleSharedFolderMessage(dispatch, data)).toThrow(/Unknown message type/);
    expect(log.error).toHaveBeenCalledTimes(1);
  });
});
