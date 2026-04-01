// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { revokeWriteAccess, grantWriteAccess, uploadPdf } from '../../api/types/outgoing/meetingNotes';
import { MeetingNotesAccess, Participant } from '../../types';
import { configureStore, mockedParticipant, renderWithProviders } from '../../utils/testUtils';
import MeetingNotesTab from './MeetingNotesTab';

vi.mock('../../modules/WebRTC/ConferenceRoom', async (importOriginal) => ({
  ...(await importOriginal()),
  getCurrentConferenceRoom: () => ({
    sendMessage: vi.fn(),
  }),
}));

describe('MeetingNotesTab', () => {
  const toParticipant = (
    participant: ReturnType<typeof mockedParticipant>,
    meetingNotesAccess?: MeetingNotesAccess
  ) => ({
    id: participant.id,
    connections: participant.connections,
    breakoutRoomId: participant.breakoutRoomId,
    displayName: participant.displayName,
    avatarUrl: participant.avatarUrl,
    handIsUp: participant.handIsUp,
    joinedAt: participant.joinedAt,
    leftAt: participant.leftAt,
    handUpdatedAt: participant.handUpdatedAt,
    participationKind: participant.participationKind,
    lastActive: participant.lastActive,
    role: participant.role,
    waitingState: participant.waitingState,
    meetingNotesAccess: meetingNotesAccess ?? participant.meetingNotesAccess,
    isRoomOwner: participant.isRoomOwner,
  });

  const userParticipant = toParticipant(mockedParticipant(0));

  const createMeetingNotesStore = ({
    participants = [],
    meetingNotesUrl = null,
    userMeetingNotesAccess = MeetingNotesAccess.None,
  }: {
    participants?: Participant[];
    meetingNotesUrl?: string | null;
    userMeetingNotesAccess?: MeetingNotesAccess;
  }) =>
    configureStore({
      initialState: {
        meetingNotes: {
          meetingNotesUrl,
        },
        participants: {
          ids: participants.map((participant) => participant.id),
          entities: Object.fromEntries(participants.map((participant) => [participant.id, participant])),
        },
        user: {
          uuid: userParticipant.id,
          displayName: userParticipant.displayName,
          avatarUrl: userParticipant.avatarUrl,
          role: userParticipant.role,
          meetingNotesAccess: userMeetingNotesAccess,
          isRoomOwner: userParticipant.isRoomOwner,
          joinedAt: userParticipant.joinedAt,
          lastActive: userParticipant.lastActive,
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('disables sending invitations when no participants are available', () => {
    const { store } = configureStore();
    renderWithProviders(<MeetingNotesTab />, { store, provider: { mui: true } });

    const sendButton = screen.getByRole('button', { name: /meeting-notes-invite-send-button/i });
    expect(sendButton).toBeDisabled();
  });

  it('shows upload action and edit labels when meeting notes already exist', async () => {
    const user = userEvent.setup();
    const { store, dispatchSpy } = createMeetingNotesStore({ meetingNotesUrl: '/notes' });
    renderWithProviders(<MeetingNotesTab />, { store, provider: { mui: true } });

    dispatchSpy.mockClear();

    const uploadButton = await screen.findByRole('button', { name: /meeting-notes-upload-pdf-button/i });
    expect(uploadButton).toBeInTheDocument();

    await user.click(uploadButton);

    expect(dispatchSpy).toHaveBeenCalledWith(uploadPdf.action());
    expect(screen.getByRole('button', { name: /meeting-notes-edit-invite-button/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /meeting-notes-update-invite-send-button/i })).toBeInTheDocument();
  });

  it('updates selection and dispatches invite actions based on checked users', async () => {
    const participants: Participant[] = [
      toParticipant(mockedParticipant(1), MeetingNotesAccess.None),
      toParticipant(mockedParticipant(2), MeetingNotesAccess.Write),
    ];
    const { store, dispatchSpy } = createMeetingNotesStore({ participants });
    renderWithProviders(<MeetingNotesTab />, { store, provider: { mui: true } });

    dispatchSpy.mockClear();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /meeting-notes-invite-button/i }));

    const popover = await screen.findByRole('dialog');
    const firstParticipantCheckbox = within(popover).getByRole('checkbox', { name: participants[0].displayName });
    const writerCheckbox = within(popover).getByRole('checkbox', { name: participants[1].displayName });

    await user.click(firstParticipantCheckbox);
    await user.click(writerCheckbox);

    await user.click(within(popover).getByRole('button', { name: 'poll-participant-list-button-select' }));

    await user.click(screen.getByRole('button', { name: /meeting-notes-invite-send-button/i }));

    expect(dispatchSpy).toHaveBeenCalledWith(grantWriteAccess.action({ participantIds: [participants[0].id] }));
    expect(dispatchSpy).toHaveBeenCalledWith(
      revokeWriteAccess.action({ participantIds: [participants[1].id, userParticipant.id] })
    );
  });

  it('filters the selectable participants by search input', async () => {
    const participants: Participant[] = [
      toParticipant(mockedParticipant(3), MeetingNotesAccess.None),
      toParticipant(mockedParticipant(4), MeetingNotesAccess.None),
    ];
    const { store } = createMeetingNotesStore({ participants });
    renderWithProviders(<MeetingNotesTab />, { store, provider: { mui: true } });

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /meeting-notes-invite-button/i }));

    const popover = await screen.findByRole('dialog');
    const searchInput = within(popover).getByRole('textbox');

    await user.type(searchInput, participants[0].displayName);

    expect(within(popover).getAllByRole('checkbox')).toHaveLength(1);
    expect(within(popover).getByRole('checkbox', { name: participants[0].displayName })).toBeInTheDocument();
    expect(within(popover).queryByRole('checkbox', { name: participants[1].displayName })).not.toBeInTheDocument();
  });
});
