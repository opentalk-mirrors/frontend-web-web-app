// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Store } from '@reduxjs/toolkit';
import { screen, act, within } from '@testing-library/react';

import { selectAllParticipants } from '../../../store/slices/participantsSlice';
import {
  Participant,
  ParticipantId,
  ParticipationKind,
  Role,
  WhisperId,
  WhisperParticipantState,
} from '../../../types';
import { mockedParticipant, mockStore, renderWithProviders } from '../../../utils/testUtils';
import ParticipantListItem from './ParticipantListItem';

jest.mock('@livekit/components-react/', () => ({
  useRemoteParticipant: () => mockedParticipant(0),
  useLocalParticipant: () => mockedParticipant(0),
}));
jest.mock('../../../commonComponents/ParticipantAvatar', () => jest.fn());
const USER_IS_MODERATOR_STORE = {
  initialState: {
    user: {
      uuid: '00000000-e6b4-4759-000' as ParticipantId,
      role: Role.Moderator,
    },
  },
};
const WHISPER_MODULE_ENABLED_STORE = {
  initialState: {
    config: {
      tariff: {
        modules: {
          subroomAudio: [],
        },
      },
    },
  },
};
const IN_WHISPER_GROUP_STORE = {
  initialState: {
    config: WHISPER_MODULE_ENABLED_STORE.initialState.config,
    user: {
      uuid: '00000000-e6b4-4759-000' as ParticipantId,
    },
    subroomAudio: {
      whisperId: 'hallo' as WhisperId,
      participants: [
        {
          participantId: '00000000-e6b4-4759-000' as ParticipantId,
          state: WhisperParticipantState.Creator,
        },
        {
          participantId: '00000000-e6b4-4759-001' as ParticipantId,
          state: WhisperParticipantState.Accepted,
        },
      ],
    },
  },
};
describe('participant context menu', () => {
  let participants: Participant[];

  const renderEachParticipant = (store: Store) => {
    participants = selectAllParticipants(store.getState());
    participants.forEach((_, index) =>
      renderWithProviders(<ParticipantListItem data={participants} index={index} style={{}} />, { store })
    );
  };
  const openMenu = (store: Store) => {
    renderEachParticipant(store);
    const participantMenuButton = screen.getAllByRole('button', { name: 'participant-menu-open-label' })[0];
    expect(participantMenuButton).toBeInTheDocument();
    act(() => participantMenuButton.click());
  };
  describe('when the user is not a moderator', () => {
    const { store } = mockStore(1);

    test('the opened menu on a participant should contain a send message option', () => {
      openMenu(store);

      const sendMessageButton = screen.queryByRole('menuitem', { name: 'participant-menu-send-message' });
      expect(sendMessageButton).toBeInTheDocument();
    });
    test('the opened menu on a participant should not contain the moderator options', () => {
      openMenu(store);
      const removeParticipantOption = screen.queryByRole('menuitem', {
        name: 'participant-menu-remove-participant',
      });
      const moveParticipantToWaitingRoomOption = screen.queryByRole('menuitem', {
        name: 'participant-menu-move-to-waiting-room',
      });
      const renameParticipantOption = screen.queryByRole('menuitem', {
        name: 'participant-menu-rename',
      });
      const grantPresenterRoleOption = screen.queryByRole('menuitem', {
        name: 'grant-presenter-role',
      });

      expect(removeParticipantOption).not.toBeInTheDocument();
      expect(moveParticipantToWaitingRoomOption).not.toBeInTheDocument();
      expect(renameParticipantOption).not.toBeInTheDocument();
      expect(grantPresenterRoleOption).not.toBeInTheDocument();
    });
  });
  describe('when the user is a moderator', () => {
    const { store } = mockStore(2, { store: USER_IS_MODERATOR_STORE });

    beforeEach(() => {
      openMenu(store);
    });

    test('the opened menu on a participant should contain the remove participant option', () => {
      const removeParticipantOption = screen.getByRole('menuitem', { name: 'participant-menu-remove-participant' });
      expect(removeParticipantOption).toBeInTheDocument();
    });
    test('the opened menu on a participant should contain the move participant to waiting room option', () => {
      const moveParticipantToWaitingRoomOption = screen.getByRole('menuitem', {
        name: 'participant-menu-move-to-waiting-room',
      });
      expect(moveParticipantToWaitingRoomOption).toBeInTheDocument();
    });
    describe('and the participant is a guest', () => {
      const { store } = mockStore(2, { role: [Role.Moderator, Role.Guest], store: USER_IS_MODERATOR_STORE });
      beforeEach(() => {
        openMenu(store);
      });
      test('the opened menu on a participant should contain the rename participant option', () => {
        const renameParticipantOption = screen.getByRole('menuitem', {
          name: 'participant-menu-rename',
        });
        expect(renameParticipantOption).toBeInTheDocument();
      });
      test('the opened menu on a participant should contain the grant presenter role option', () => {
        const grantPresenterRoleOption = screen.getByRole('menuitem', {
          name: 'grant-presenter-role',
        });
        expect(grantPresenterRoleOption).toBeInTheDocument();
      });
    });
    describe('and the participant is a user', () => {
      const { store } = mockStore(2, { role: [Role.Moderator, Role.User], store: USER_IS_MODERATOR_STORE });
      beforeEach(() => {
        openMenu(store);
      });
      test('the opened menu on a participant should contain the grant moderator option', () => {
        const grantModeratorOption = screen.getByRole('menuitem', {
          name: 'participant-menu-grant-moderator',
        });
        expect(grantModeratorOption).toBeInTheDocument();
      });
      test('the opened menu on a participant should contain the grant presenter role option', () => {
        const grantPresenterRoleOption = screen.getByRole('menuitem', {
          name: 'grant-presenter-role',
        });
        expect(grantPresenterRoleOption).toBeInTheDocument();
      });
    });
  });

  describe('when the user is not in a whisper group', () => {
    const { store } = mockStore(1);
    beforeEach(() => {
      openMenu(store);
    });

    test('clicking on the ... button on a participant list item should open a menu ', () => {
      const menu = screen.getByRole('presentation');
      expect(menu).toBeInTheDocument();
    });

    describe('and the whisper module is disabled', () => {
      test('the opened menu should not contain a whisper invite option', () => {
        const whisperInviteButton = screen.queryByRole('menuitem', { name: 'participant-menu-start-whisper' });
        expect(whisperInviteButton).not.toBeInTheDocument();
      });
    });

    describe('and the whisper module is enabled', () => {
      const { store } = mockStore(4, { store: WHISPER_MODULE_ENABLED_STORE });

      test('the opened menu should contain a whisper invite button', () => {
        openMenu(store);
        const whisperInviteButton = screen.getByRole('menuitem', { name: 'participant-menu-start-whisper' });
        expect(whisperInviteButton).toBeInTheDocument();
      });
    });
  });

  describe('when the user is in a whisper group', () => {
    const { store } = mockStore(2, { store: IN_WHISPER_GROUP_STORE });

    beforeEach(() => {
      renderEachParticipant(store);
    });

    const getUserMenuButton = () => {
      const userParticipantListItem = screen
        .getAllByRole('listitem')
        .find((el) => el?.textContent?.includes(participants[0].displayName));
      expect(userParticipantListItem).toBeInTheDocument();
      const userMenuButton = within(userParticipantListItem!).getByRole('button', {
        name: 'participant-menu-open-label',
      });
      expect(userMenuButton).toBeInTheDocument();
      return userMenuButton;
    };

    const getParticipantMenuButton = (index = 1) => {
      const participantListItem = screen
        .getAllByRole('listitem')
        .find((el) => el?.textContent?.includes(participants[index].displayName));
      expect(participantListItem).toBeInTheDocument();
      const menuButton = within(participantListItem!).getByRole('button', {
        name: 'participant-menu-open-label',
      });
      expect(menuButton).toBeInTheDocument();
      return menuButton;
    };

    test('a menu button on the user themselves should be available', () => {
      const userMenuButton = getUserMenuButton();
      act(() => userMenuButton.click());
      const userMenu = screen.getByRole('presentation');
      expect(userMenu).toBeInTheDocument();
    });

    describe('the opened context menu on the user list item', () => {
      beforeEach(() => {
        renderEachParticipant(store);
        const userMenuButton = getUserMenuButton();
        expect(userMenuButton).toBeInTheDocument();
        act(() => userMenuButton.click());
      });

      test('should not contain an invite option', () => {
        const whisperInviteOption = screen.queryByRole('menuitem', { name: 'participant-menu-start-whisper' });

        expect(whisperInviteOption).not.toBeInTheDocument();
      });
      test('should contain a leave whisper group option', () => {
        const leaveWhisperGroupOption = screen.getByRole('menuitem', { name: 'participant-menu-leave-whisper' });

        expect(leaveWhisperGroupOption).toBeInTheDocument();
      });
    });
    describe('the opened context menu on a participant list item of a participant in the same whisper group', () => {
      test('should not display an invite to whisper group option', () => {
        renderEachParticipant(store);
        const whisperPartnerMenuButton = getParticipantMenuButton();
        expect(whisperPartnerMenuButton).toBeInTheDocument();
        act(() => whisperPartnerMenuButton.click());

        const inviteWhisperPartnerOption = screen.queryByRole('menuitem', { name: 'participant-menu-start-whisper' });
        expect(inviteWhisperPartnerOption).not.toBeInTheDocument();
      });
    });
    describe('the opened context menu on participant list item of a participant not in the whisper group', () => {
      test('should contain an invite to whisper group option', () => {
        const { store } = mockStore(3, {
          store: IN_WHISPER_GROUP_STORE,
        });
        renderEachParticipant(store);

        const whisperPartnerMenuButton = getParticipantMenuButton(2);
        expect(whisperPartnerMenuButton).toBeInTheDocument();

        act(() => whisperPartnerMenuButton.click());

        const inviteWhisperPartnerOption = screen.getByRole('menuitem', {
          name: 'participant-menu-invite-whisper-partner',
        });

        expect(inviteWhisperPartnerOption).toBeInTheDocument();
      });
      test('should not contain an invite to whisper group option on sip participants', () => {
        const { store } = mockStore(3, {
          store: IN_WHISPER_GROUP_STORE,
          participantKinds: [ParticipationKind.User, ParticipationKind.User, ParticipationKind.Sip],
        });
        renderEachParticipant(store);

        const whisperPartnerMenuButton = getParticipantMenuButton(2);
        expect(whisperPartnerMenuButton).toBeInTheDocument();

        act(() => whisperPartnerMenuButton.click());

        const inviteWhisperPartnerOption = screen.queryByRole('menuitem', {
          name: 'participant-menu-invite-whisper-partner',
        });

        expect(inviteWhisperPartnerOption).toBeInTheDocument();
      });
    });
  });
});
