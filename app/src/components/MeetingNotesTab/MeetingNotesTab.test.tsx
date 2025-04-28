// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import React from 'react';

import { ParticipantId, MeetingNotesParticipant } from '../../types';
import { render, configureStore, screen, fireEvent, cleanup, act } from '../../utils/testUtils';
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

  afterAll(() => cleanup());

  it('MeetingNotesTab component should be rendered without breaking', async () => {
    await render(<MeetingNotesTab />, store);
    const nextButton = screen.getByRole('button', { name: /meeting-notes-invite-send-button/i });
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toBeDisabled();
  });

  it('When there is a selected user send invitation button should be enable', async () => {
    const setState = jest.fn();
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [initialUserValue, setState]);

    await render(<MeetingNotesTab />, store);

    const sendInvitationButton = screen.getByLabelText(/meeting-notes-invite-send-button/i);
    expect(sendInvitationButton).toBeInTheDocument();
    expect(sendInvitationButton).toBeEnabled();
  });

  it('Click on send invitation button should dispatch right action', async () => {
    const sendInvitations = jest.fn();
    // const realUseState = React.useState;
    // jest.spyOn(React, 'useState').mockImplementationOnce(() => realUseState(initialUserValue));

    await render(<MeetingNotesTab />, store);

    const sendInvitationButton = screen.getByLabelText(/meeting-notes-invite-send-button/i);
    sendInvitationButton.onclick = sendInvitations;
    expect(sendInvitationButton).toBeInTheDocument();
    expect(sendInvitationButton).toBeEnabled();
    await act(() => {
      fireEvent.click(sendInvitationButton);
    });
    expect(sendInvitations).toHaveBeenCalledTimes(1);
  });
});
