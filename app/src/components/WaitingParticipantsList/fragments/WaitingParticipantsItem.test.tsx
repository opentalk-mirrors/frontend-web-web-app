// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mock } from 'vitest';

import { acceptParticipantFromWaitingRoomToRoom } from '../../../api/types/outgoing/moderation';
import { notifications } from '../../../commonComponents';
import * as Hooks from '../../../hooks';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { approveToEnter } from '../../../store/slices/participantsSlice';
import { WaitingState } from '../../../types';
import { mockedParticipant, renderWithProviders } from '../../../utils/testUtils';
import WaitingParticipantItem from './WaitingParticipantsItem';

const dispatchMock = vi.fn();

vi.mock('../../../hooks/useMediaQuery', () => ({
  __esModule: true,
  useIsMobile: vi.fn(),
}));

describe('WaitingParticipantItem', () => {
  const mockUseIsMobile = useIsMobile as Mock;

  beforeEach(() => {
    dispatchMock.mockClear();
    vi.spyOn(Hooks, 'useAppDispatch').mockReturnValue(
      dispatchMock as unknown as ReturnType<typeof Hooks.useAppDispatch>
    );
    mockUseIsMobile.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('renders waiting participant info and accepts them', async () => {
    const user = userEvent.setup();
    const participant = { ...mockedParticipant(1), displayName: 'Alice Doe', waitingState: WaitingState.Waiting };
    vi.spyOn(Hooks, 'useDateFormat').mockReturnValue('10:15');
    const notificationInfoSpy = vi.spyOn(notifications, 'info').mockImplementation(() => {});

    renderWithProviders(<WaitingParticipantItem participant={participant} />, {
      provider: { mui: true },
    });

    expect(screen.getByText(participant.displayName)).toBeInTheDocument();
    expect(screen.getByText(/participant-joined-text/)).toBeInTheDocument();

    const acceptButton = screen.getByRole('button', { name: 'participant-menu-accept-participant' });
    await user.click(acceptButton);

    expect(dispatchMock).toHaveBeenCalledTimes(2);
    expect(dispatchMock).toHaveBeenCalledWith(
      acceptParticipantFromWaitingRoomToRoom.action({ target: participant.id })
    );
    expect(dispatchMock).toHaveBeenCalledWith(approveToEnter(participant.id));
    expect(notificationInfoSpy).toHaveBeenCalledWith('meeting-notification-user-was-accepted');
  });

  it('shows accepted state on mobile when participant is approved', () => {
    const participant = { ...mockedParticipant(2), waitingState: WaitingState.Approved };
    vi.spyOn(Hooks, 'useDateFormat').mockReturnValue('08:30');
    mockUseIsMobile.mockReturnValue(true);

    renderWithProviders(<WaitingParticipantItem participant={participant} />, {
      provider: { mui: true },
    });

    const acceptedButton = screen.getByRole('button', { name: 'participant-menu-accepted-participant-mobile' });

    expect(acceptedButton).toBeDisabled();
    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it('does not render an action button when participant is already joined', () => {
    const participant = { ...mockedParticipant(3), waitingState: WaitingState.Joined };
    vi.spyOn(Hooks, 'useDateFormat').mockReturnValue('09:45');

    renderWithProviders(<WaitingParticipantItem participant={participant} />, {
      provider: { mui: true },
    });

    expect(screen.queryByRole('button', { name: /participant-menu/ })).not.toBeInTheDocument();
  });
});
