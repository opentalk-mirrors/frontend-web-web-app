// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Participant, ParticipantId } from '../../../../types';
import { renderWithProviders } from '../../../../utils/testUtils';
import { ParticipantsPopoverContent } from '../ParticipantsPopoverContent';

describe('ParticipantsPopoverContent', () => {
  it('renders given participants', () => {
    const participants = [
      { id: '1', displayName: 'Alice' },
      { id: '2', displayName: 'Bob' },
    ] as Array<Pick<Participant, 'id' | 'displayName'>>;

    renderWithProviders(
      <ParticipantsPopoverContent
        participants={participants}
        assignedParticipants={[]}
        editingRoomIndex={0}
        onSave={() => {}}
        onCancel={() => {}}
      />,
      { provider: { mui: true } }
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders assigned participants as checked', () => {
    const participants = [
      { id: '1', displayName: 'Alice' },
      { id: '2', displayName: 'Bob' },
    ] as Array<Pick<Participant, 'id' | 'displayName'>>;

    const assignedParticipants = ['1'] as Array<ParticipantId>;

    renderWithProviders(
      <ParticipantsPopoverContent
        participants={participants}
        assignedParticipants={assignedParticipants}
        editingRoomIndex={0}
        onSave={() => {}}
        onCancel={() => {}}
      />,
      { provider: { mui: true } }
    );

    const aliceCheckbox = screen.getByRole('checkbox', { name: 'Alice' });
    const bobCheckbox = screen.getByRole('checkbox', { name: 'Bob' });
    expect(aliceCheckbox).toBeChecked();
    expect(bobCheckbox).not.toBeChecked();
  });

  it('has disabled save button when no changes are recorded.', () => {
    const participants = [
      { id: '1', displayName: 'Alice' },
      { id: '2', displayName: 'Bob' },
    ] as Array<Pick<Participant, 'id' | 'displayName'>>;

    const assignedParticipants = ['1'] as Array<ParticipantId>;

    renderWithProviders(
      <ParticipantsPopoverContent
        participants={participants}
        assignedParticipants={assignedParticipants}
        editingRoomIndex={0}
        onSave={() => {}}
        onCancel={() => {}}
      />,
      { provider: { mui: true } }
    );

    const saveButton = screen.getByRole('button', { name: 'user-selection-button-save' });
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when changes are recorded.', async () => {
    const participants = [
      { id: '1', displayName: 'Alice' },
      { id: '2', displayName: 'Bob' },
    ] as Array<Pick<Participant, 'id' | 'displayName'>>;

    const assignedParticipants = ['1'] as Array<ParticipantId>;

    renderWithProviders(
      <ParticipantsPopoverContent
        participants={participants}
        assignedParticipants={assignedParticipants}
        editingRoomIndex={0}
        onSave={() => {}}
        onCancel={() => {}}
      />,
      { provider: { mui: true } }
    );

    const bobCheckbox = screen.getByRole('checkbox', { name: 'Bob' });
    await userEvent.click(bobCheckbox);
    const saveButton = screen.getByRole('button', { name: 'user-selection-button-save' });
    expect(saveButton).toBeEnabled();
  });

  it('calls onSave with selected participant ids when save button is clicked', async () => {
    const participants = [
      { id: '1', displayName: 'Alice' },
      { id: '2', displayName: 'Bob' },
    ] as Array<Pick<Participant, 'id' | 'displayName'>>;

    const assignedParticipants = ['1'] as Array<ParticipantId>;

    const onSaveMock = vi.fn();

    renderWithProviders(
      <ParticipantsPopoverContent
        participants={participants}
        assignedParticipants={assignedParticipants}
        editingRoomIndex={0}
        onSave={onSaveMock}
        onCancel={() => {}}
      />,
      { provider: { mui: true } }
    );

    const bobCheckbox = screen.getByRole('checkbox', { name: 'Bob' });
    await userEvent.click(bobCheckbox);
    const saveButton = screen.getByRole('button', { name: 'user-selection-button-save' });
    await userEvent.click(saveButton);
    expect(onSaveMock).toHaveBeenCalledWith(['1', '2']);
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const participants = [
      { id: '1', displayName: 'Alice' },
      { id: '2', displayName: 'Bob' },
    ] as Array<Pick<Participant, 'id' | 'displayName'>>;

    const onCancelMock = vi.fn();

    renderWithProviders(
      <ParticipantsPopoverContent
        participants={participants}
        assignedParticipants={[]}
        editingRoomIndex={0}
        onSave={() => {}}
        onCancel={onCancelMock}
      />,
      { provider: { mui: true } }
    );

    const cancelButton = screen.getByRole('button', { name: 'user-selection-button-cancel' });
    await userEvent.click(cancelButton);
    expect(onCancelMock).toHaveBeenCalled();
  });

  it('does not include participant who left after being selected on save', async () => {
    const participants = [
      { id: '1', displayName: 'Alice' },
      { id: '2', displayName: 'Bob' },
      { id: '3', displayName: 'Charlie' },
    ] as Array<Pick<Participant, 'id' | 'displayName'>>;

    const assignedParticipants = ['1'] as Array<ParticipantId>;

    const onSaveMock = vi.fn();

    const { rerender } = renderWithProviders(
      <ParticipantsPopoverContent
        participants={participants}
        assignedParticipants={assignedParticipants}
        editingRoomIndex={0}
        onSave={onSaveMock}
        onCancel={() => {}}
      />,
      { provider: { mui: true } }
    );

    const bobCheckbox = screen.getByRole('checkbox', { name: 'Bob' });
    await userEvent.click(bobCheckbox);
    const charlieCheckbox = screen.getByRole('checkbox', { name: 'Charlie' });
    await userEvent.click(charlieCheckbox);

    // Simulate Bob leaving the conference
    const updatedParticipants = [
      { id: '1', displayName: 'Alice' },
      { id: '3', displayName: 'Charlie' },
    ] as Array<Pick<Participant, 'id' | 'displayName'>>;

    rerender(
      <ParticipantsPopoverContent
        participants={updatedParticipants}
        assignedParticipants={assignedParticipants}
        editingRoomIndex={0}
        onSave={onSaveMock}
        onCancel={() => {}}
      />
    );

    const saveButton = screen.getByRole('button', { name: 'user-selection-button-save' });
    await userEvent.click(saveButton);
    expect(onSaveMock).toHaveBeenCalledWith(['1', '3']);
  });
});
