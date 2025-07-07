// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { GroupId } from '../../../types';
import { configureStore, mockedParticipant, renderWithProviders } from '../../../utils/testUtils';
import ParticipantSimpleList from './ParticipantSimpleList';

jest.mock('@livekit/components-react', () => ({
  useRemoteParticipant: jest.fn(),
  useLocalParticipant: () => ({
    isMicrophoneEnabled: false,
    isScreenShareEnabled: false,
  }),
}));

const setup = () => {
  const participants = [
    { ...mockedParticipant(0), groups: ['Group A' as GroupId] },
    { ...mockedParticipant(1), groups: ['Group A' as GroupId] },
    { ...mockedParticipant(2), groups: ['Group B' as GroupId] },
  ];

  const store = configureStore({
    initialState: {
      user: {
        groups: ['Group A', 'Group B'],
      },
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
});
