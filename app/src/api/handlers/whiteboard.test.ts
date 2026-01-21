// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { AssetId } from '@opentalk/rest-api-rtk-query';
import i18next from 'i18next';

import { notificationAction } from '../../commonComponents';
import type { RootState } from '../../store';
import { addWhiteboardAsset } from '../../store/slices/whiteboardSlice';
import { WhiteboardError } from '../types/incoming/whiteboard';
import type { Message as WhiteboardMessage } from '../types/incoming/whiteboard';
import { handleStorageExceededError } from './helpers';
import { handleWhiteboardMessage } from './whiteboard';

vi.mock('i18next', () => ({
  default: {
    t: vi.fn((key: string) => key),
  },
}));

vi.mock('../../commonComponents', () => ({
  notificationAction: vi.fn(),
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
    ...overrides,
  }) as RootState;

describe('handleWhiteboardMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds pdf assets and notifies', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: WhiteboardMessage = {
      message: 'pdf_created',
      assetId: 'asset-1' as AssetId,
      filename: 'board.pdf',
    };

    handleWhiteboardMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(
      addWhiteboardAsset({ asset: { assetId: data.assetId, filename: data.filename } })
    );
    expect(notificationAction).toHaveBeenCalledExactlyOnceWith({
      msg: i18next.t('whiteboard-new-pdf-message'),
      variant: 'info',
      ariaLive: 'polite',
    });
  });

  it('routes storage errors through helper', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: WhiteboardMessage = { message: 'error', error: WhiteboardError.StorageExceeded };

    handleWhiteboardMessage(dispatch, data, state);

    expect(handleStorageExceededError).toHaveBeenCalledExactlyOnceWith(state, WhiteboardError.StorageExceeded);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('throws on unknown message type', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data = { message: 'unknown' } as unknown as WhiteboardMessage;

    expect(() => handleWhiteboardMessage(dispatch, data, state)).toThrow(/Unknown message type/);
  });
});
