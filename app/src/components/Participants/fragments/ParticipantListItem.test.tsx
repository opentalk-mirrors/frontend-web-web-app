// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BackendModules } from '@opentalk/rest-api-rtk-query';
import { Store } from '@reduxjs/toolkit';
import { screen, within, fireEvent } from '@testing-library/react';
import { List } from 'react-window';

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

vi.mock('@livekit/components-react', () => ({
  useRemoteParticipant: () => mockedParticipant(0),
  useLocalParticipant: () => mockedParticipant(0),
}));
vi.mock('../../../commonComponents/ParticipantAvatar', () => ({
  default: vi.fn(),
}));
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
      enabledModules: { [BackendModules.SubroomAudio]: [] },
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
    renderWithProviders(
      <List
        rowComponent={ParticipantListItem}
        rowHeight={69}
        rowCount={participants.length}
        rowProps={{ data: participants }}
      />,
      {
        store,
        provider: { mui: true },
      }
    );
  };
  const openMenu = (store: Store) => {
    renderEachParticipant(store);
    const participantMenuButton = screen.getAllByRole('button', { name: 'participant-menu-open-label' })[0];
    expect(participantMenuButton).toBeInTheDocument();
    fireEvent.click(participantMenuButton);
  };
  describe('when the user is not a moderator', () => {
    const { store } = mockStore(1);

    it('should contain a send message option in the opened menu on a participant', () => {
      openMenu(store);

      const sendMessageButton = screen.queryByRole('menuitem', { name: 'participant-menu-send-message' });
      expect(sendMessageButton).toBeInTheDocument();
    });
    it('should not contain the moderator options in the opened menu on a participant', () => {
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

    it('should contain the remove participant option in the opened menu on a participant', () => {
      const removeParticipantOption = screen.getByRole('menuitem', { name: 'participant-menu-remove-participant' });
      expect(removeParticipantOption).toBeInTheDocument();
    });
    it('should contain the move participant to waiting room option in the opened menu on a participant', () => {
      const moveParticipantToWaitingRoomOption = screen.getByRole('menuitem', {
        name: 'participant-menu-move-to-waiting-room',
      });
      expect(moveParticipantToWaitingRoomOption).toBeInTheDocument();
    });
    describe('and the participant is a guest', () => {
      const { store } = mockStore(2, {
        role: [Role.Moderator, Role.User],
        participantKinds: [ParticipationKind.Registered, ParticipationKind.Guest],
        store: USER_IS_MODERATOR_STORE,
      });
      beforeEach(() => {
        openMenu(store);
      });
      it('should contain the rename participant option in the opened menu on a participant', () => {
        const renameParticipantOption = screen.getByRole('menuitem', {
          name: 'participant-menu-rename',
        });
        expect(renameParticipantOption).toBeInTheDocument();
      });
      it('should contain the grant presenter role option in the opened menu on a participant', () => {
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
      it('should contain the grant moderator option in the opened menu on a participant', () => {
        const grantModeratorOption = screen.getByRole('menuitem', {
          name: 'participant-menu-grant-moderator',
        });
        expect(grantModeratorOption).toBeInTheDocument();
      });
      it('should contain the grant presenter role option in the opened menu on a participant', () => {
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

    it('should open a menu on clicking on the ... button on a participant list item', () => {
      const menu = screen.getByRole('presentation');
      expect(menu).toBeInTheDocument();
    });

    describe('and the whisper module is disabled', () => {
      it('should not contain a whisper invite option in the opened menu', () => {
        const whisperInviteButton = screen.queryByRole('menuitem', { name: 'participant-menu-start-whisper' });
        expect(whisperInviteButton).not.toBeInTheDocument();
      });
    });

    describe('and the whisper module is enabled', () => {
      const { store } = mockStore(4, { store: WHISPER_MODULE_ENABLED_STORE });

      it('should contain a whisper invite button in the opened menu', () => {
        openMenu(store);
        const whisperInviteButton = screen.getByRole('menuitem', { name: 'participant-menu-start-whisper' });
        expect(whisperInviteButton).toBeInTheDocument();
      });
    });
  });

  describe('when the user is in a whisper group', () => {
    const { store } = mockStore(2, { store: IN_WHISPER_GROUP_STORE });

    const setup = () => renderEachParticipant(store);

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

    it('should enable a menu button on the user themselves', () => {
      setup();
      const userMenuButton = getUserMenuButton();
      fireEvent.click(userMenuButton);
      const userMenu = screen.getByRole('presentation');
      expect(userMenu).toBeInTheDocument();
    });

    describe('the opened context menu on the user list item', () => {
      it('should not contain an invite option', () => {
        setup();
        const userMenuButton = getUserMenuButton();
        expect(userMenuButton).toBeInTheDocument();
        fireEvent.click(userMenuButton);

        const whisperInviteOption = screen.queryByRole('menuitem', { name: 'participant-menu-start-whisper' });

        expect(whisperInviteOption).not.toBeInTheDocument();
      });
      it('should contain a leave whisper group option', () => {
        setup();
        const userMenuButton = getUserMenuButton();
        expect(userMenuButton).toBeInTheDocument();
        fireEvent.click(userMenuButton);

        const leaveWhisperGroupOption = screen.getByRole('menuitem', { name: 'participant-menu-leave-whisper' });

        expect(leaveWhisperGroupOption).toBeInTheDocument();
      });
    });
    describe('the opened context menu on a participant list item of a participant in the same whisper group', () => {
      it('should not display an invite to whisper group option', () => {
        renderEachParticipant(store);
        const whisperPartnerMenuButton = getParticipantMenuButton();
        expect(whisperPartnerMenuButton).toBeInTheDocument();
        fireEvent.click(whisperPartnerMenuButton);

        const inviteWhisperPartnerOption = screen.queryByRole('menuitem', { name: 'participant-menu-start-whisper' });
        expect(inviteWhisperPartnerOption).not.toBeInTheDocument();
      });
    });
    describe('the opened context menu on participant list item of a participant not in the whisper group', () => {
      it('should contain an invite to whisper group option', () => {
        const { store } = mockStore(3, {
          store: IN_WHISPER_GROUP_STORE,
        });
        renderEachParticipant(store);

        const whisperPartnerMenuButton = getParticipantMenuButton(2);
        expect(whisperPartnerMenuButton).toBeInTheDocument();

        fireEvent.click(whisperPartnerMenuButton);

        const inviteWhisperPartnerOption = screen.getByRole('menuitem', {
          name: 'participant-menu-invite-whisper-partner',
        });

        expect(inviteWhisperPartnerOption).toBeInTheDocument();
      });
      it('should not contain an invite to whisper group option on sip participants', () => {
        const { store } = mockStore(3, {
          store: IN_WHISPER_GROUP_STORE,
          participantKinds: [ParticipationKind.Registered, ParticipationKind.CallIn],
        });
        renderEachParticipant(store);

        const whisperPartnerMenuButton = getParticipantMenuButton(2);
        expect(whisperPartnerMenuButton).toBeInTheDocument();

        fireEvent.click(whisperPartnerMenuButton);

        const inviteWhisperPartnerOption = screen.queryByRole('menuitem', {
          name: 'participant-menu-invite-whisper-partner',
        });

        expect(inviteWhisperPartnerOption).toBeInTheDocument();
      });
    });
  });
});
