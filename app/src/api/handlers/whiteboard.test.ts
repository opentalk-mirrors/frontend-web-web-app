// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { RootState } from '../../store';
import { setEditRestrictions } from '../../store/slices/whiteboardSlice';
import { ParticipantId } from '../../types';
import { WhiteboardError } from '../types/incoming/whiteboard';
import type { WhiteboardPayload as WhiteboardMessage } from '../types/incoming/whiteboard';
import { handleWhiteboardMessage } from './whiteboard';

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

  it('does not dispatch on module errors', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: WhiteboardMessage = { message: 'error', error: WhiteboardError.InsufficientPermissions };

    handleWhiteboardMessage(dispatch, data, state);

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('stores enabled edit restrictions in redux', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data = {
      message: 'edit_restrictions_enabled',
      unrestrictedParticipants: ['participant-1' as ParticipantId, 'participant-2' as ParticipantId],
    } satisfies WhiteboardMessage;

    handleWhiteboardMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(
      setEditRestrictions({ enabled: true, participants: data.unrestrictedParticipants })
    );
  });

  it('stores disabled edit restrictions in redux', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data = {
      message: 'edit_restrictions_disabled',
    } satisfies WhiteboardMessage;

    handleWhiteboardMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(setEditRestrictions({ enabled: false, participants: [] }));
  });
});
