// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { notificationAction, notifications } from '../../commonComponents';
import LayoutOptions from '../../enums/LayoutOptions';
import type { RootState } from '../../store';
import { setMeetingNotesReadUrl, setMeetingNotesWriteUrl } from '../../store/slices/meetingNotesSlice';
import { updatedCinemaLayout } from '../../store/slices/uiSlice';
import { MeetingNotesAccess, ParticipationKind, Role } from '../../types';
import type { IncomingMeetingNotes } from '../types/incoming/meetingNotes';
import { MeetingNotesError } from '../types/incoming/meetingNotes';
import { handleStorageExceededError } from './helpers';
import { handleMeetingNotesMessage } from './meetingNotes';

vi.mock('i18next', () => ({
  default: {
    t: vi.fn((key: string) => key),
  },
}));

vi.mock('../../commonComponents', () => ({
  notificationAction: vi.fn(),
  notifications: {
    info: vi.fn(),
  },
}));

vi.mock('./helpers', () => ({
  handleStorageExceededError: vi.fn(),
}));

const createState = (overrides: Partial<RootState> = {}) =>
  ({
    user: {
      meetingNotesAccess: MeetingNotesAccess.None,
      role: Role.User,
      uuid: null,
      displayName: '',
      isRoomOwner: false,
    },
    ...overrides,
  }) as RootState;

const createUserState = (overrides: Partial<RootState['user']> = {}): RootState['user'] => ({
  meetingNotesAccess: MeetingNotesAccess.None,
  role: Role.User,
  uuid: null,
  displayName: '',
  isRoomOwner: false,
  participationKind: ParticipationKind.Registered,
  ...overrides,
});

describe('handleMeetingNotesMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('notifies when a pdf asset is available', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: IncomingMeetingNotes = {
      message: 'pdf_created',
      filename: 'notes.pdf',
      assetId: 'asset-1',
    };

    handleMeetingNotesMessage(dispatch, data, state);

    expect(notifications.info).toHaveBeenCalledExactlyOnceWith('meeting-notes-upload-pdf-message');
  });

  it('dispatches write URL and opens meeting notes when access is none', () => {
    const dispatch = vi.fn();
    const state = createState({
      user: createUserState({
        meetingNotesAccess: MeetingNotesAccess.None,
        role: Role.Moderator,
      }),
    });
    const url = new URL('https://example.com/notes');
    const data: IncomingMeetingNotes = {
      message: 'write_access_received',
      url,
    };

    handleMeetingNotesMessage(dispatch, data, state);

    expect(notificationAction).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: 'meeting-notes-created-all-notification',
        actionBtnText: 'meeting-notes-new-meeting-notes-message-button',
        variant: 'info',
        ariaLive: 'polite',
        onAction: expect.any(Function),
      })
    );
    expect(dispatch).toHaveBeenCalledWith(setMeetingNotesWriteUrl(url.toString()));

    const onAction = vi.mocked(notificationAction).mock.calls[0]?.[0].onAction;
    onAction?.();

    expect(dispatch).toHaveBeenCalledWith(
      updatedCinemaLayout({ layout: LayoutOptions.MeetingNotes, cacheLastLayout: true })
    );
  });

  it('dispatches read URL without opening meeting notes when access already exists', () => {
    const dispatch = vi.fn();
    const state = createState({
      user: createUserState({
        meetingNotesAccess: MeetingNotesAccess.Read,
        role: Role.User,
      }),
    });
    const url = new URL('https://example.com/readonly');
    const data: IncomingMeetingNotes = {
      message: 'read_access_received',
      url,
    };

    handleMeetingNotesMessage(dispatch, data, state);

    expect(notificationAction).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(setMeetingNotesReadUrl(url.toString()));
  });

  it('routes errors through storage helper', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: IncomingMeetingNotes = { message: 'error', error: MeetingNotesError.StorageExceeded };

    handleMeetingNotesMessage(dispatch, data, state);

    expect(handleStorageExceededError).toHaveBeenCalledExactlyOnceWith(state, MeetingNotesError.StorageExceeded);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('throws on unknown message type', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data = { message: 'unknown' } as unknown as IncomingMeetingNotes;

    expect(() => handleMeetingNotesMessage(dispatch, data, state)).toThrow(/Unknown message type/);
  });
});
