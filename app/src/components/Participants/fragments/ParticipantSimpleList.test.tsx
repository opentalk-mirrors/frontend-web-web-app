// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

  it('closes an open participant menu when the concerned user leaves', async () => {
    const user = userEvent.setup();
    const { store, participants } = setup();

    const { rerender } = renderWithProviders(<ParticipantSimpleList participants={participants} />, {
      store,
      provider: { mui: true },
    });

    const menuButtons = screen.getAllByRole('button', { name: 'participant-menu-open-label' });
    await user.click(menuButtons[1]);

    expect(screen.getByRole('menuitem', { name: 'participant-menu-send-message' })).toBeInTheDocument();

    const participantsAfterLeave = [participants[0], participants[2]];
    rerender(<ParticipantSimpleList participants={participantsAfterLeave} />);

    expect(screen.queryByRole('menuitem', { name: 'participant-menu-send-message' })).not.toBeInTheDocument();
  });
});
