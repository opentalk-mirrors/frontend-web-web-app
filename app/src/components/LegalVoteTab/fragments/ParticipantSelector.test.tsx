// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFormikContext } from 'formik';
import React from 'react';
import { Mock } from 'vitest';

import { useAppSelector } from '../../../hooks';
import { ParticipantId } from '../../../types';
import ParticipantSelector, { AllowedParticipant } from './ParticipantSelector';

vi.mock('formik', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('formik');
  return {
    ...actual,
    useFormikContext: vi.fn(),
  };
});

vi.mock('../../../hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('../../../commonComponents', () => ({
  CommonTextField: ({
    onChange,
    slotProps: _slotProps,
    fullWidth: _fullWidth,
    ...props
  }: { onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void } & Record<string, unknown>) => (
    <input type="text" onChange={onChange} {...props} />
  ),
  ParticipantAvatar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../../assets/icons', () => ({
  SearchIcon: () => <svg data-testid="search-icon" />,
}));

describe('ParticipantSelector', () => {
  const participants: AllowedParticipant[] = [
    {
      id: 'participant-1' as ParticipantId,
      displayName: 'Alice Example',
      avatarUrl: 'alice.png',
    },
    {
      id: 'participant-2' as ParticipantId,
      displayName: 'Bob Example',
      avatarUrl: 'bob.png',
    },
  ];

  const mockUseFormikContext = useFormikContext as unknown as Mock;
  const mockUseAppSelector = useAppSelector as unknown as Mock;
  let setFieldValue: Mock;

  const renderComponent = () => render(<ParticipantSelector name="allowedParticipants" />);

  beforeEach(() => {
    setFieldValue = vi.fn();
    mockUseFormikContext.mockReturnValue({
      setFieldValue,
      errors: {},
    });
    mockUseAppSelector.mockImplementation(() => participants);
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders participants and toggles individual selection', async () => {
    const user = userEvent.setup();
    renderComponent();

    const [aliceItem] = await screen.findAllByRole('listitem');
    const aliceCheckbox = within(aliceItem).getByRole('checkbox');
    expect(aliceCheckbox).not.toBeChecked();

    await user.click(aliceItem);

    expect(aliceCheckbox).toBeChecked();
    expect(setFieldValue).toHaveBeenLastCalledWith('allowedParticipants', [
      expect.objectContaining({ id: participants[0].id, isSelected: true }),
    ]);
  });

  it('selects and deselects all participants with the select all button', async () => {
    const user = userEvent.setup();
    renderComponent();

    const selectAllButton = await screen.findByRole('button', {
      name: 'poll-participant-list-button-select-all',
    });

    await user.click(selectAllButton);
    screen.getAllByRole('checkbox').forEach((checkbox) => expect(checkbox).toBeChecked());
    expect(setFieldValue).toHaveBeenLastCalledWith('allowedParticipants', [
      expect.objectContaining({ id: participants[0].id, isSelected: true }),
      expect.objectContaining({ id: participants[1].id, isSelected: true }),
    ]);

    await user.click(selectAllButton);
    screen.getAllByRole('checkbox').forEach((checkbox) => expect(checkbox).not.toBeChecked());
    expect(setFieldValue).toHaveBeenLastCalledWith('allowedParticipants', []);
  });

  it('filters participants based on the search input', async () => {
    renderComponent();

    const searchInput = screen.getByRole('textbox');

    await userEvent.type(searchInput, 'Bob');

    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(1));
    const [visibleItem] = screen.getAllByRole('listitem');
    expect(within(visibleItem).getAllByText('Bob Example')).not.toHaveLength(0);
    expect(screen.queryByText('Alice Example')).not.toBeInTheDocument();
  });

  it('renders an error message from formik', async () => {
    mockUseFormikContext.mockReturnValue({
      setFieldValue,
      errors: { allowedParticipants: 'Select at least one participant' },
    });

    renderComponent();

    expect(await screen.findByText('Select at least one participant')).toBeInTheDocument();
  });
});
