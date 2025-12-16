// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { ComponentProps } from 'react';
import { Mock } from 'vitest';

import { useAppSelector } from '../../../hooks';
import { MeetingNotesAccess, Participant, ParticipantId, ParticipationKind, WaitingState } from '../../../types';
import ParticipantsSelector from './ParticipantsSelector';
import { DropdownOptions } from './constants';

vi.mock('i18next', () => {
  const i18nMock = {
    use: vi.fn().mockReturnThis(),
    init: vi.fn().mockReturnThis(),
    t: (key: string, options?: { roomNumber?: number }) => (options?.roomNumber ? `Room ${options.roomNumber}` : key),
    on: vi.fn(),
    loadNamespaces: vi.fn(),
    reloadResources: vi.fn(() => Promise.resolve()),
    changeLanguage: vi.fn(),
    language: 'en',
  };
  return {
    __esModule: true,
    default: i18nMock,
    t: i18nMock.t,
  };
});

vi.mock('../../../hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('../../../commonComponents', () => ({
  AccordionItem: ({
    summaryText,
    expanded,
    onChange,
    children,
  }: {
    summaryText: string;
    expanded: boolean;
    onChange: (event: React.SyntheticEvent<Element, Event>, expanded: boolean) => void;
    children: React.ReactNode;
  }) => {
    const normalizedSummaryText = summaryText.replace(/\s+/g, '-').replace(/[()]/g, '');
    return (
      <div data-testid={`accordion-${normalizedSummaryText}`}>
        <button type="button" aria-expanded={expanded} onClick={(event) => onChange(event, !expanded)}>
          {summaryText}
        </button>
        {expanded && <div data-testid={`panel-${normalizedSummaryText}`}>{children}</div>}
      </div>
    );
  },
}));

vi.mock('./ParticipantsEditor', () => ({
  __esModule: true,
  default: ({
    title,
    onChange,
    unAssignedParticipants,
    assignedParticipants,
  }: {
    title: string;
    onChange: (participants: Participant[]) => void;
    unAssignedParticipants: Participant[];
    assignedParticipants: Participant[];
  }) => (
    <div data-testid={`participants-editor-${title}`}>
      <div data-testid={`assigned-${title}`}>
        {assignedParticipants.length ? assignedParticipants.map((p) => p.displayName).join(', ') : 'empty'}
      </div>
      <div data-testid={`unassigned-${title}`}>
        {unAssignedParticipants.length ? unAssignedParticipants.map((p) => p.displayName).join(', ') : 'empty'}
      </div>
      <button
        data-testid={`assign-${title}`}
        type="button"
        onClick={() =>
          onChange(
            unAssignedParticipants.length ? [...assignedParticipants, unAssignedParticipants[0]] : assignedParticipants
          )
        }
      >
        assign-{title}
      </button>
      <button data-testid={`clear-${title}`} type="button" onClick={() => onChange([])}>
        clear-{title}
      </button>
    </div>
  ),
}));

type ParticipantsSelectorProps = ComponentProps<typeof ParticipantsSelector>;

const createParticipant = (id: string, displayName: string): Participant => ({
  id: id as ParticipantId,
  breakoutRoomId: null,
  displayName,
  handIsUp: false,
  joinedAt: '2024-01-01T00:00:00.000Z',
  leftAt: null,
  handUpdatedAt: undefined,
  groups: [],
  participationKind: ParticipationKind.User,
  lastActive: '2024-01-01T00:00:00.000Z',
  waitingState: WaitingState.Joined,
  meetingNotesAccess: MeetingNotesAccess.None,
  isRoomOwner: false,
});

describe('ParticipantsSelector', () => {
  let currentParticipants: Participant[];
  let mockUseAppSelector: Mock;
  let onChange: Mock;

  const getProps = (props?: Partial<ParticipantsSelectorProps>): ParticipantsSelectorProps => ({
    assignments: [],
    selectionMode: DropdownOptions.Rooms,
    rooms: 2,
    participantsPerRoom: 2,
    onChange,
    ...props,
  });

  const renderParticipantsSelector = (props?: Partial<ParticipantsSelectorProps>) =>
    render(<ParticipantsSelector {...getProps(props)} />);

  beforeEach(() => {
    currentParticipants = [
      createParticipant('participant-1', 'Alice Example'),
      createParticipant('participant-2', 'Bob Example'),
      createParticipant('participant-3', 'Charlie Example'),
    ];
    onChange = vi.fn();
    mockUseAppSelector = useAppSelector as unknown as Mock;
    mockUseAppSelector.mockImplementation(() => currentParticipants);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates rooms based on the requested count when no assignments are provided', () => {
    renderParticipantsSelector({ rooms: 3, assignments: [], selectionMode: DropdownOptions.Rooms });

    expect(screen.getAllByTestId(/participants-editor-/)).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Room 1 (0)' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'Room 3 (0)' })).toBeInTheDocument();
    expect(screen.getByTestId('unassigned-Room 1')).toHaveTextContent('Alice Example, Bob Example, Charlie Example');
  });

  it('derives the number of rooms from participants per room when using participant mode', () => {
    currentParticipants = [
      createParticipant('participant-1', 'Alice Example'),
      createParticipant('participant-2', 'Bob Example'),
      createParticipant('participant-3', 'Charlie Example'),
      createParticipant('participant-4', 'Diana Example'),
      createParticipant('participant-5', 'Eve Example'),
      createParticipant('participant-6', 'Frank Example'),
      createParticipant('participant-7', 'Grace Example'),
    ];
    mockUseAppSelector.mockImplementation(() => currentParticipants);

    renderParticipantsSelector({
      assignments: [],
      selectionMode: DropdownOptions.Participants,
      participantsPerRoom: 4,
      rooms: 10,
    });

    expect(screen.getAllByTestId(/participants-editor-/)).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Room 1 (0)' })).toBeInTheDocument();
    expect(screen.getByTestId('unassigned-Room 1')).toHaveTextContent(
      'Alice Example, Bob Example, Charlie Example, Diana Example, Eve Example, Frank Example, Grace Example'
    );
  });

  it.skip('updates assignments, unassigned participants, and expansion state when a room changes', async () => {
    const user = userEvent.setup();
    const assignments = [
      { name: 'Room A', assignments: [currentParticipants[0]] },
      { name: 'Room B', assignments: [] },
    ];

    const { rerender } = renderParticipantsSelector({ assignments });

    expect(screen.getByTestId('unassigned-Room A')).toHaveTextContent('Bob Example, Charlie Example');
    expect(screen.getByTestId('unassigned-Room B')).toHaveTextContent('Bob Example, Charlie Example');

    await user.click(screen.getByTestId('assign-Room B'));

    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith([
        { name: 'Room A', assignments: [currentParticipants[0]] },
        { name: 'Room B', assignments: [currentParticipants[1]] },
      ])
    );

    const updatedAssignments = onChange.mock.calls.at(-1)?.[0] as ParticipantsSelectorProps['assignments'];
    rerender(<ParticipantsSelector {...getProps({ assignments: updatedAssignments })} />);

    await waitFor(() => expect(screen.getByTestId('unassigned-Room A')).toHaveTextContent('Charlie Example'));
    expect(screen.getByTestId('assigned-Room B')).toHaveTextContent('Bob Example');
    expect(screen.getByRole('button', { name: 'Room B (1)' })).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByTestId('clear-Room B'));

    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith([
        { name: 'Room A', assignments: [currentParticipants[0]] },
        { name: 'Room B', assignments: [] },
      ])
    );

    const clearedAssignments = onChange.mock.calls.at(-1)?.[0] as ParticipantsSelectorProps['assignments'];
    rerender(<ParticipantsSelector {...getProps({ assignments: clearedAssignments })} />);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Room B (0)' })).toHaveAttribute('aria-expanded', 'false')
    );
    expect(screen.getByTestId('unassigned-Room A')).toHaveTextContent('Bob Example, Charlie Example');
  });

  it.skip('removes assignments for participants that are no longer returned by the selector', async () => {
    currentParticipants = [
      createParticipant('participant-1', 'Alice Example'),
      createParticipant('participant-2', 'Bob Example'),
    ];
    mockUseAppSelector.mockImplementation(() => currentParticipants);

    const assignments = [{ name: 'Room A', assignments: [...currentParticipants] }];

    const { rerender } = renderParticipantsSelector({ assignments, rooms: 1 });

    expect(screen.getByTestId('assigned-Room A')).toHaveTextContent('Alice Example, Bob Example');

    currentParticipants = [currentParticipants[0]];

    rerender(
      <ParticipantsSelector
        assignments={assignments}
        selectionMode={DropdownOptions.Rooms}
        rooms={1}
        participantsPerRoom={2}
        onChange={onChange}
      />
    );

    await waitFor(() => expect(screen.getByTestId('assigned-Room A')).toHaveTextContent('Alice Example'));
    expect(screen.getByTestId('assigned-Room A')).not.toHaveTextContent('Bob Example');
    expect(screen.getByTestId('unassigned-Room A')).toHaveTextContent('empty');
  });
});
