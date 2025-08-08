// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { ParticipantId, MeetingNotesParticipant } from '../../types';
import { configureStore, renderWithProviders } from '../../utils/testUtils';
import MeetingNotesTab from './MeetingNotesTab';

describe.skip('MeetingNotesTab component tests', () => {
  const { store } = configureStore();

  const initialUserValue: MeetingNotesParticipant[] = [
    {
      id: '12345' as ParticipantId,
      displayName: 'test name',
      isSelected: true,
    },
  ];

  it('MeetingNotesTab component should be rendered without breaking', () => {
    renderWithProviders(<MeetingNotesTab />, { store });
    const nextButton = screen.getByRole('button', { name: /meeting-notes-invite-send-button/i });
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toBeDisabled();
  });

  it('When there is a selected user send invitation button should be enable', () => {
    const setState = vi.fn();
    vi.spyOn(React, 'useState').mockImplementationOnce(() => [initialUserValue, setState]);

    renderWithProviders(<MeetingNotesTab />, { store });

    const sendInvitationButton = screen.getByLabelText(/meeting-notes-invite-send-button/i);
    expect(sendInvitationButton).toBeInTheDocument();
    expect(sendInvitationButton).toBeEnabled();
  });

  it('Click on send invitation button should dispatch right action', () => {
    const sendInvitations = vi.fn();
    // const realUseState = React.useState;
    // vi.spyOn(React, 'useState').mockImplementationOnce(() => realUseState(initialUserValue));

    renderWithProviders(<MeetingNotesTab />, { store });

    const sendInvitationButton = screen.getByLabelText(/meeting-notes-invite-send-button/i);
    sendInvitationButton.onclick = sendInvitations;
    expect(sendInvitationButton).toBeInTheDocument();
    expect(sendInvitationButton).toBeEnabled();
    fireEvent.click(sendInvitationButton);
    expect(sendInvitations).toHaveBeenCalledTimes(1);
  });
});
