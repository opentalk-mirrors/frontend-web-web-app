// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps, useState } from 'react';

import { mockedParticipant, renderWithProviders } from '../../../utils/testUtils';
import ParticipantsEditor from './ParticipantsEditor';

describe('ParticipantsEditor', () => {
  const title = 'Room 1';
  const assignedParticipant = mockedParticipant(1);
  const unassignedParticipant = mockedParticipant(2);

  const renderComponent = (props?: Partial<ComponentProps<typeof ParticipantsEditor>>) => {
    const onChange = vi.fn();

    const utils = renderWithProviders(
      <ParticipantsEditor
        onChange={onChange}
        assignedParticipants={[assignedParticipant]}
        unAssignedParticipants={[unassignedParticipant]}
        title={title}
        {...props}
      />,
      { provider: { mui: true } }
    );

    return { onChange, ...utils };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens the popover and shows assigned/unassigned participants', async () => {
    const { onChange } = renderComponent();

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByText(title)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'user-editor-button-edit' }));

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText('user-selection-not-assigned-users:')).toBeInTheDocument();
    expect(screen.getByText('user-selection-assigned-users:')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: assignedParticipant.displayName })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: unassignedParticipant.displayName })).not.toBeChecked();
  });

  it('updates selected participants and saves changes', async () => {
    const { onChange } = renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'user-editor-button-edit' }));

    await userEvent.click(screen.getByRole('checkbox', { name: unassignedParticipant.displayName }));
    await userEvent.click(screen.getByRole('checkbox', { name: assignedParticipant.displayName }));

    await userEvent.click(screen.getByRole('button', { name: 'user-selection-button-save' }));

    expect(onChange).toHaveBeenCalledWith([unassignedParticipant]);
    expect(screen.queryByText('user-selection-assigned-users:')).not.toBeInTheDocument();
  });

  it('removes unavailable participants from the selection on rerender', async () => {
    const onChange = vi.fn();

    const Wrapper = () => {
      const [unassignedParticipants, setUnassignedParticipants] = useState([unassignedParticipant]);

      return (
        <>
          <ParticipantsEditor
            onChange={onChange}
            assignedParticipants={[assignedParticipant]}
            unAssignedParticipants={unassignedParticipants}
            title={title}
          />
          <button type="button" onClick={() => setUnassignedParticipants([])}>
            remove-unassigned
          </button>
        </>
      );
    };

    renderWithProviders(<Wrapper />, { provider: { mui: true } });

    await userEvent.click(screen.getByRole('button', { name: 'user-editor-button-edit' }));
    await userEvent.click(screen.getByRole('checkbox', { name: unassignedParticipant.displayName }));

    await userEvent.click(screen.getByRole('button', { name: 'user-selection-button-cancel' }));
    await userEvent.click(screen.getByRole('button', { name: 'remove-unassigned' }));
    await userEvent.click(screen.getByRole('button', { name: 'user-editor-button-edit' }));

    expect(screen.queryByLabelText(unassignedParticipant.displayName)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'user-selection-button-save' }));

    expect(onChange).toHaveBeenCalledWith([assignedParticipant]);
  });
});
