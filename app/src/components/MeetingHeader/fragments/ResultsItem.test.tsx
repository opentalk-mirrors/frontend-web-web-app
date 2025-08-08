// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import type { Poll } from '../../../store/slices/pollSlice';
import { LegalVoteState, type LegalVote } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import ResultsItem from './ResultsItem';

vi.mock('../../../assets/icons', async () => ({
  ...(await vi.importActual('../../../assets/icons')),
  PollIcon: () => <div>PollIcon</div>,
  LegalBallotIcon: () => <div>LegalBallotIcon</div>,
}));

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof import('@mui/material')>('@mui/material');

  return {
    ...actual,
    styled: (component: () => unknown) => () => component,
    Chip: (props: { color: string }) => <div>Color: {props.color} </div>,
  };
});

describe('ResultsItem rendering logic', () => {
  it('should render LegalBalloutIcon when item is a LegalVote', () => {
    const { store } = configureStore({});

    const item = {
      id: '1',
      name: 'Test Vote',
      state: LegalVoteState.Started,
    } as Pick<LegalVote, 'name' | 'id' | 'state'>;

    renderWithProviders(<ResultsItem item={item} />, { store });
    expect(screen.getByText('LegalBallotIcon')).toBeInTheDocument();
  });

  it('should render PollIcon when item is a Poll', () => {
    const { store } = configureStore({});

    const item = {
      id: '1' as Poll['id'],
      topic: 'Test Poll',
      state: 'active',
      choices: [],
    } as Pick<Poll, 'topic' | 'id' | 'state' | 'choices'>;

    renderWithProviders(<ResultsItem item={item} />, { store });
    expect(screen.getByText('PollIcon')).toBeInTheDocument();
  });

  it("should render item's name when item is a LegalVote", () => {
    const { store } = configureStore({});

    const item = {
      id: '1',
      name: 'Test Vote',
      state: LegalVoteState.Started,
    } as Pick<LegalVote, 'name' | 'id' | 'state'>;

    renderWithProviders(<ResultsItem item={item} />, { store });
    expect(screen.getByText('Test Vote')).toBeInTheDocument();
  });

  it("should render item's topic when item is a Poll", () => {
    const { store } = configureStore({});

    const item = {
      id: '1' as Poll['id'],
      topic: 'Test Poll',
      state: 'active',
      choices: [],
    } as Pick<Poll, 'topic' | 'id' | 'state' | 'choices'>;

    renderWithProviders(<ResultsItem item={item} />, { store });
    expect(screen.getByText('Test Poll')).toBeInTheDocument();
  });

  it('should render chip in success color when legal vote is in started state', () => {
    const { store } = configureStore({});

    const item = {
      id: '1',
      name: 'Test Vote',
      state: LegalVoteState.Started,
    } as Pick<LegalVote, 'name' | 'id' | 'state'>;

    renderWithProviders(<ResultsItem item={item} />, { store });
    expect(screen.getByText('Color: success')).toBeInTheDocument();
  });

  it('should render chip in success color when poll is in active state', () => {
    const { store } = configureStore({});

    const item = {
      id: '1' as Poll['id'],
      topic: 'Test Poll',
      state: 'active',
      choices: [],
    } as Pick<Poll, 'topic' | 'id' | 'state' | 'choices'>;

    renderWithProviders(<ResultsItem item={item} />, { store });
    expect(screen.getByText('Color: success')).toBeInTheDocument();
  });

  it('should render chip in error color when legal vote state is not started', () => {
    const { store } = configureStore({});

    const item = {
      id: '1',
      name: 'Test Vote',
      state: LegalVoteState.Finished,
    } as Pick<LegalVote, 'name' | 'id' | 'state'>;

    renderWithProviders(<ResultsItem item={item} />, { store });
    expect(screen.getByText('Color: error')).toBeInTheDocument();
  });

  it('should render chip in error color when poll state is not active', () => {
    const { store } = configureStore({});

    const item = {
      id: '1' as Poll['id'],
      topic: 'Test Poll',
      state: 'finished',
      choices: [],
    } as Pick<Poll, 'topic' | 'id' | 'state' | 'choices'>;

    renderWithProviders(<ResultsItem item={item} />, { store });
    expect(screen.getByText('Color: error')).toBeInTheDocument();
  });
});

describe('ResultsItem callback logic', () => {
  it('should call setVoteOrPollIdToShow when clicked', () => {
    const { store } = configureStore({});

    const item = {
      id: '1',
      name: 'Test Vote',
      state: LegalVoteState.Started,
    } as Pick<LegalVote, 'name' | 'id' | 'state'>;

    renderWithProviders(<ResultsItem item={item} />, { store });
    const element = screen.getByText('Test Vote');
    fireEvent.click(element);
    expect(store.getState()).toEqual(
      expect.objectContaining({
        ui: expect.objectContaining({
          voteOrPollIdToShow: '1',
        }),
      })
    );
  });
});
