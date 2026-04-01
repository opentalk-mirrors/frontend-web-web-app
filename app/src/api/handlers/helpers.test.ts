// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { notifications } from '../../commonComponents';
import type { RootState } from '../../store';
import { MeetingNotesAccess } from '../../types';
import { LegalVoteError } from '../types/incoming/legalVote';
import {
  handleStorageExceededError,
  mapMeetingNotesToMeetingNotesAccess,
  showErrorNotification,
  showStorageNotification,
} from './helpers';

vi.mock('i18next', () => ({
  default: {
    t: (key: string) => key,
  },
}));

vi.mock('../../commonComponents', () => ({
  notifications: {
    binaryAction: vi.fn(),
    error: vi.fn(),
  },
  setLibravatarOptions: vi.fn(() => 'mocked-avatar'),
}));

const createState = (isTariffUpgradable: boolean) =>
  ({
    config: {
      libravatarDefaultImage: 'robohash',
      provider: {
        accountManagementUrl: 'https://account.example',
      },
    },
    user: {
      isTariffUpgradable,
    },
  }) as RootState;

describe('helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('mapMeetingNotesToMeetingNotesAccess', () => {
    it('returns none when meeting notes are missing', () => {
      expect(mapMeetingNotesToMeetingNotesAccess()).toBe(MeetingNotesAccess.None);
    });

    it('returns read when meeting notes are readonly', () => {
      expect(mapMeetingNotesToMeetingNotesAccess({ readonly: true })).toBe(MeetingNotesAccess.Read);
    });

    it('returns write when meeting notes are writable', () => {
      expect(mapMeetingNotesToMeetingNotesAccess({ readonly: false })).toBe(MeetingNotesAccess.Write);
    });
  });

  describe('showErrorNotification', () => {
    it('uses legal vote error keys when available', () => {
      showErrorNotification(LegalVoteError.InvalidVoteId);

      expect(notifications.error).toHaveBeenCalledExactlyOnceWith('invalid-vote-id-error');
    });

    it('falls back to internal error for unknown codes', () => {
      showErrorNotification('unknown_error');

      expect(notifications.error).toHaveBeenCalledExactlyOnceWith('internal-error');
    });
  });

  describe('showStorageNotification', () => {
    it('prompts for upgrade when the plan is upgradable', () => {
      const state = createState(true);

      showStorageNotification(state, 'warning');

      expect(notifications.binaryAction).toHaveBeenCalledExactlyOnceWith(
        'conference-storage-almost-full-plan-upgrade',
        expect.objectContaining({
          type: 'warning',
          persist: true,
          primaryBtnText: 'global-upgrade',
          secondaryBtnText: 'dashboard-settings-storage',
          onPrimary: expect.any(Function),
          onSecondary: expect.any(Function),
          secondaryBtnProps: { color: 'primary' },
        })
      );
    });

    it('prompts storage settings when upgrades are unavailable', () => {
      const state = createState(false);

      showStorageNotification(state, 'error');

      expect(notifications.binaryAction).toHaveBeenCalledExactlyOnceWith(
        'conference-storage-full-no-plan-upgrade',
        expect.objectContaining({
          type: 'error',
          persist: true,
          primaryBtnText: 'dashboard-settings-storage',
          onPrimary: expect.any(Function),
        })
      );
    });
  });

  describe('handleStorageExceededError', () => {
    it('notifies when storage is exceeded', () => {
      const state = createState(false);

      handleStorageExceededError(state, 'storage_exceeded');

      expect(notifications.binaryAction).toHaveBeenCalledExactlyOnceWith(
        'conference-storage-full-no-plan-upgrade',
        expect.objectContaining({ type: 'error' })
      );
    });

    it('ignores non storage errors', () => {
      const state = createState(false);

      handleStorageExceededError(state, 'other_error');

      expect(notifications.binaryAction).not.toHaveBeenCalled();
    });
  });
});
