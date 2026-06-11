// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import { renderWithProviders, configureStore } from '../../../utils/testUtils';
import ReactionButton from './ReactionButton';

describe('<ReactionButton />', () => {
  it('should render ReactionButton component', () => {
    const { store } = configureStore();
    renderWithProviders(<ReactionButton />, { store, provider: { mui: true } });

    expect(screen.getByTestId('toolbarReactionButton')).toBeInTheDocument();
  });

  it('should open the reaction popover on click', () => {
    const { store } = configureStore();
    renderWithProviders(<ReactionButton />, { store, provider: { mui: true } });

    const button = screen.getByTestId('toolbarReactionButton');
    fireEvent.click(button);

    // 8 emojis; toolbar button is aria-hidden due to modal Popover
    expect(screen.getAllByRole('button')).toHaveLength(8);
  });

  it('should close the popover on second click', () => {
    const { store } = configureStore();
    renderWithProviders(<ReactionButton />, { store, provider: { mui: true } });

    const button = screen.getByTestId('toolbarReactionButton');
    fireEvent.click(button);
    fireEvent.click(button);

    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('should dispatch reactCommand when selecting an emoji', () => {
    const { store, dispatchSpy } = configureStore();
    renderWithProviders(<ReactionButton />, { store, provider: { mui: true } });

    const button = screen.getByTestId('toolbarReactionButton');
    fireEvent.click(button);

    const thumbsUp = screen.getByLabelText('thumbs_up');
    fireEvent.click(thumbsUp);

    expect(dispatchSpy.mock.calls).toContainEqual([
      { payload: { reaction: 'thumbs_up' }, type: 'signaling/reaction/react' },
    ]);
  });

  it('should close the popover after selecting an emoji', () => {
    const { store } = configureStore();
    renderWithProviders(<ReactionButton />, { store, provider: { mui: true } });

    const button = screen.getByTestId('toolbarReactionButton');
    fireEvent.click(button);

    const heart = screen.getByLabelText('heart');
    fireEvent.click(heart);

    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('should have aria-expanded true when popover is open', () => {
    const { store } = configureStore();
    renderWithProviders(<ReactionButton />, { store, provider: { mui: true } });

    const button = screen.getByTestId('toolbarReactionButton');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('should be disabled when reaction is not allowed', () => {
    const { store } = configureStore({
      initialState: {
        reaction: {
          restrictionsState: { type: 'enabled', unrestrictedParticipants: [] },
          activeReactions: {},
        },
      },
    });
    renderWithProviders(<ReactionButton />, { store, provider: { mui: true } });

    const button = screen.getByTestId('toolbarReactionButton');
    expect(button).toBeDisabled();
  });
});
