// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ParticipantId, ParticipationKind, Role } from '../../../types';
import { configureStore, mockedParticipant, renderWithProviders } from '../../../utils/testUtils';
import ParticipantSimpleList from './ParticipantSimpleList';

vi.mock('@livekit/components-react', () => ({
  useRemoteParticipant: vi.fn(),
  useLocalParticipant: () => ({
    isMicrophoneEnabled: false,
    isScreenShareEnabled: false,
  }),
}));

const setup = () => {
  const participants = [{ ...mockedParticipant(0) }, { ...mockedParticipant(1) }, { ...mockedParticipant(2) }];

  const store = configureStore({
    initialState: {
      participants: {
        ids: participants.map((p) => p.id),
        entities: Object.fromEntries(participants.map((p) => [p.id, p])),
      },
    },
  });

  return {
    ...store,
    participants,
  };
};

const setupModerator = () => {
  const participants = [
    { ...mockedParticipant(0, ParticipationKind.Guest) },
    { ...mockedParticipant(1, ParticipationKind.Guest) },
    { ...mockedParticipant(2, ParticipationKind.Guest) },
  ];

  const { store } = configureStore({
    initialState: {
      participants: {
        ids: participants.map((p) => p.id),
        entities: Object.fromEntries(participants.map((p) => [p.id, p])),
      },
      user: {
        uuid: 'moderator-uuid' as ParticipantId,
        role: Role.Moderator,
      },
    },
  });

  return { store, participants };
};

describe('ParticipantSimpleList', () => {
  // AutoSizer uses measurements APIs that JSDOm doesn't support.
  // https://github.com/bvaughn/react-virtualized-auto-sizer/blob/45b1270b631829c29746de23ad8d60b9a19f0960/src/AutoSizer.test.tsx#L18
  const width = 600;
  const height = 600;

  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({ height, width }),
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    value: height,
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    value: width,
  });

  it('renders a list with all participants', () => {
    const { store, participants } = setup();

    renderWithProviders(<ParticipantSimpleList participants={participants} />, { store, provider: { mui: true } });

    expect(screen.getByText('Test User Randy Mock0')).toBeInTheDocument();
    expect(screen.getByText('Test User Randy Mock1')).toBeInTheDocument();
    expect(screen.getByText('Test User Randy Mock2')).toBeInTheDocument();

    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('renders an empty list if no participants', () => {
    const { store } = setup();

    renderWithProviders(<ParticipantSimpleList participants={[]} />, { store });

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.queryByText(/Test User Randy Mock/)).not.toBeInTheDocument();
  });

  it('keeps an open participant menu open when the participants list changes (user joins/leaves)', async () => {
    const user = userEvent.setup();
    const { store, participants } = setup();

    const { rerender } = renderWithProviders(<ParticipantSimpleList participants={participants} />, {
      store,
      provider: { mui: true },
    });

    const menuButton = screen.getAllByRole('button', { name: 'participant-menu-open-label' })[0];
    await user.click(menuButton);

    expect(screen.getByRole('menuitem', { name: 'participant-menu-send-message' })).toBeInTheDocument();

    // Simulate a user joining
    const participantsAfterJoin = [...participants, { ...mockedParticipant(3) }];
    rerender(<ParticipantSimpleList participants={participantsAfterJoin} />);

    expect(screen.getByRole('menuitem', { name: 'participant-menu-send-message' })).toBeInTheDocument();

    // Simulate a user leaving
    rerender(<ParticipantSimpleList participants={participants} />);

    expect(screen.getByRole('menuitem', { name: 'participant-menu-send-message' })).toBeInTheDocument();
  });

  it('keeps the rename dialog on the correct participant when a different user leaves', async () => {
    const user = userEvent.setup();
    const { store, participants } = setupModerator();

    const { rerender } = renderWithProviders(<ParticipantSimpleList participants={participants} />, {
      store,
      provider: { mui: true },
    });

    // Start renaming the middle participant (Mock1)
    const menuButtons = screen.getAllByRole('button', { name: 'participant-menu-open-label' });
    await user.click(menuButtons[1]);
    await user.click(screen.getByRole('menuitem', { name: 'participant-menu-rename' }));

    expect(screen.getByRole('textbox', { name: 'participant-menu-rename-new-name' })).toHaveValue(
      'Test User Randy Mock1'
    );

    // A different participant (Mock0) leaves - the rows shift, but the dialog must keep showing the
    // participant it was opened for (Mock1)
    rerender(<ParticipantSimpleList participants={[participants[1], participants[2]]} />);

    expect(screen.getByRole('textbox', { name: 'participant-menu-rename-new-name' })).toHaveValue(
      'Test User Randy Mock1'
    );
  });

  it('closes the rename dialog when the participant being renamed leaves', async () => {
    const user = userEvent.setup();
    const { store, participants } = setupModerator();

    const { rerender } = renderWithProviders(<ParticipantSimpleList participants={participants} />, {
      store,
      provider: { mui: true },
    });

    // Start renaming the first participant (Mock0)
    const menuButtons = screen.getAllByRole('button', { name: 'participant-menu-open-label' });
    await user.click(menuButtons[0]);
    await user.click(screen.getByRole('menuitem', { name: 'participant-menu-rename' }));

    expect(screen.getByRole('textbox', { name: 'participant-menu-rename-new-name' })).toHaveValue(
      'Test User Randy Mock0'
    );

    // The renamed participant (Mock0) leaves - the dialog must close
    rerender(<ParticipantSimpleList participants={[participants[1], participants[2]]} />);

    await waitForElementToBeRemoved(() => screen.queryByRole('textbox', { name: 'participant-menu-rename-new-name' }));
    expect(screen.queryByRole('textbox', { name: 'participant-menu-rename-new-name' })).not.toBeInTheDocument();
  });

  it('keeps the removal dialog open when a different user leaves', async () => {
    const user = userEvent.setup();
    const { store, participants } = setupModerator();

    const { rerender } = renderWithProviders(<ParticipantSimpleList participants={participants} />, {
      store,
      provider: { mui: true },
    });

    // Open the removal dialog for the middle participant (Mock1)
    const menuButtons = screen.getAllByRole('button', { name: 'participant-menu-open-label' });
    await user.click(menuButtons[1]);
    await user.click(screen.getByRole('menuitem', { name: 'participant-menu-remove-participant' }));

    expect(screen.getByRole('button', { name: 'participant-remove-dialog-confirm' })).toBeInTheDocument();

    // A different participant (Mock0) leaves - the dialog must stay open
    rerender(<ParticipantSimpleList participants={[participants[1], participants[2]]} />);

    expect(screen.getByRole('button', { name: 'participant-remove-dialog-confirm' })).toBeInTheDocument();
  });

  it('closes the removal dialog when the participant being removed leaves', async () => {
    const user = userEvent.setup();
    const { store, participants } = setupModerator();

    const { rerender } = renderWithProviders(<ParticipantSimpleList participants={participants} />, {
      store,
      provider: { mui: true },
    });

    // Open the removal dialog for the first participant (Mock0)
    const menuButtons = screen.getAllByRole('button', { name: 'participant-menu-open-label' });
    await user.click(menuButtons[0]);
    await user.click(screen.getByRole('menuitem', { name: 'participant-menu-remove-participant' }));

    expect(screen.getByRole('button', { name: 'participant-remove-dialog-confirm' })).toBeInTheDocument();

    // The participant being removed (Mock0) leaves - the dialog must close
    rerender(<ParticipantSimpleList participants={[participants[1], participants[2]]} />);

    await waitForElementToBeRemoved(() => screen.queryByRole('button', { name: 'participant-remove-dialog-confirm' }));
    expect(screen.queryByRole('button', { name: 'participant-remove-dialog-confirm' })).not.toBeInTheDocument();
  });
});
