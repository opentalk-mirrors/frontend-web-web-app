// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { disableEditRestrictions, enableEditRestrictions } from '../../../api/types/outgoing/whiteboard';
import { MeetingNotesAccess, ParticipantId, ParticipationKind, Role } from '../../../types';
import { configureStore, mockedParticipant, renderWithProviders } from '../../../utils/testUtils';
import RestrictionsDialog from './RestrictionsDialog';

vi.mock('../../../api/types/outgoing/common', () => ({
  sendMessage: vi.fn(),
}));

const createParticipant = ({
  index,
  displayName,
  role = Role.User,
}: {
  index: number;
  displayName: string;
  role?: Role;
}) => {
  const participant = mockedParticipant(index, ParticipationKind.Registered, role);
  const {
    identity: _identity,
    isCameraEnabled: _isCameraEnabled,
    isMicrophoneEnabled: _isMicrophoneEnabled,
    getTrackPublication: _getTrackPublication,
    setMicrophoneEnabled: _setMicrophoneEnabled,
    videoTrackPublications: _videoTrackPublications,
    ...serializableParticipant
  } = participant;

  return {
    ...serializableParticipant,
    displayName,
  };
};

const participantAlpha = createParticipant({ index: 1, displayName: 'Alpha User' });
const participantBravo = createParticipant({ index: 2, displayName: 'Bravo User' });
const participantModerator = createParticipant({ index: 3, displayName: 'Charlie Moderator', role: Role.Moderator });

const currentUserId = 'current-user' as ParticipantId;
const currentUserBaseState = {
  uuid: currentUserId,
  displayName: 'Current User',
  role: Role.Moderator,
  participationKind: ParticipationKind.Registered,
  meetingNotesAccess: MeetingNotesAccess.None,
  isRoomOwner: false,
  joinedAt: '2026-03-23T10:00:00.000Z',
  lastActive: '2026-03-23T10:00:00.000Z',
};

const renderRestrictionsDialog = ({
  isModerator = true,
  editRestrictionsEnabled = true,
  unrestrictedParticipants = [participantBravo.id],
}: {
  isModerator?: boolean;
  editRestrictionsEnabled?: boolean;
  unrestrictedParticipants?: ParticipantId[];
} = {}) => {
  const onClose = vi.fn();
  const { store, dispatchSpy } = configureStore({
    initialState: {
      participants: {
        ids: [participantAlpha.id, participantBravo.id, participantModerator.id],
        entities: {
          [participantAlpha.id]: participantAlpha,
          [participantBravo.id]: participantBravo,
          [participantModerator.id]: participantModerator,
        },
      },
      user: {
        ...currentUserBaseState,
        role: isModerator ? Role.Moderator : Role.User,
      },
      whiteboard: {
        editRestrictions: {
          enabled: editRestrictionsEnabled,
          unrestrictedParticipants,
        },
      },
    },
  });

  renderWithProviders(<RestrictionsDialog open onClose={onClose} />, { store, provider: { mui: true } });

  dispatchSpy.mockClear();

  return { dispatchSpy, onClose };
};

describe('RestrictionsDialog', () => {
  it('renders only non moderators sorted by display name', () => {
    renderRestrictionsDialog();

    expect(screen.queryByText(participantModerator.displayName)).not.toBeInTheDocument();

    const participantButtons = within(screen.getByRole('list')).getAllByRole('button');

    expect(participantButtons).toHaveLength(2);
    expect(participantButtons[0]).toHaveAccessibleName(new RegExp(participantAlpha.displayName));
    expect(participantButtons[1]).toHaveAccessibleName(new RegExp(participantBravo.displayName));
  });

  it('filters participants by search value and shows an empty state when nothing matches', async () => {
    const user = userEvent.setup();

    renderRestrictionsDialog();

    await user.type(screen.getByRole('textbox', { name: 'whiteboard-dialog-edit-restrictions-search-label' }), 'alpha');

    expect(screen.getByText(participantAlpha.displayName)).toBeInTheDocument();
    expect(screen.queryByText(participantBravo.displayName)).not.toBeInTheDocument();

    await user.clear(screen.getByRole('textbox', { name: 'whiteboard-dialog-edit-restrictions-search-label' }));
    await user.type(
      screen.getByRole('textbox', { name: 'whiteboard-dialog-edit-restrictions-search-label' }),
      'no-match'
    );

    expect(screen.getByText('whiteboard-dialog-edit-restrictions-empty')).toBeInTheDocument();
  });

  it('disables search and participant selection when restrictions are turned off', () => {
    renderRestrictionsDialog({ editRestrictionsEnabled: false });

    expect(screen.getByRole('textbox', { name: 'whiteboard-dialog-edit-restrictions-search-label' })).toBeDisabled();
    expect(screen.getByRole('button', { name: new RegExp(participantAlpha.displayName) })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByRole('button', { name: new RegExp(participantBravo.displayName) })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('dispatches disable edit restrictions when submitting with the switch turned off', async () => {
    const user = userEvent.setup();
    const { dispatchSpy, onClose } = renderRestrictionsDialog();

    await user.click(screen.getByRole('switch', { name: 'whiteboard-dialog-edit-restrictions-switch-label' }));
    await user.click(screen.getByRole('button', { name: 'global-submit' }));

    expect(dispatchSpy).toHaveBeenCalledExactlyOnceWith(disableEditRestrictions.action());
    expect(onClose).toHaveBeenCalledExactlyOnceWith();
  });

  it('dispatches enabled restrictions with the selected non moderator participants only', async () => {
    const user = userEvent.setup();
    const { dispatchSpy, onClose } = renderRestrictionsDialog({
      unrestrictedParticipants: [participantAlpha.id, participantModerator.id],
    });

    await user.click(screen.getByRole('button', { name: new RegExp(participantBravo.displayName) }));
    await user.click(screen.getByRole('button', { name: 'global-submit' }));

    expect(dispatchSpy).toHaveBeenCalledExactlyOnceWith(
      enableEditRestrictions.action({
        unrestrictedParticipants: [participantAlpha.id, participantBravo.id],
      })
    );
    expect(onClose).toHaveBeenCalledExactlyOnceWith();
  });

  it('does not dispatch restriction changes for non moderators', async () => {
    const user = userEvent.setup();
    const { dispatchSpy, onClose } = renderRestrictionsDialog({ isModerator: false });

    await user.click(screen.getByRole('button', { name: 'global-submit' }));

    expect(dispatchSpy).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
