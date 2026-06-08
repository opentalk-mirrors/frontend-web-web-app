// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import { ReactionEmoji } from '../../../types/reaction';
import { renderWithProviders, configureStore } from '../../../utils/testUtils';
import ReactionPopover from './ReactionPopover';

describe('<ReactionPopover />', () => {
  const { store } = configureStore();
  const onClose = vi.fn();
  const onSelect = vi.fn();

  const renderPopover = (open = true) => {
    const anchor = document.createElement('div');
    document.body.appendChild(anchor);

    renderWithProviders(<ReactionPopover anchorEl={anchor} open={open} onClose={onClose} onSelect={onSelect} />, {
      store,
      provider: { mui: true },
    });

    return anchor;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all 8 emoji buttons when open', () => {
    renderPopover();

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(8);
  });

  it('should display emojis in the correct order', () => {
    renderPopover();

    const buttons = screen.getAllByRole('button');
    const expectedEmojis = ['👍', '👏', '❤️', '🎉', '😮', '😂', '🥲', '👎'];

    buttons.forEach((button, index) => {
      expect(button).toHaveTextContent(expectedEmojis[index]);
    });
  });

  it('should not render emoji buttons when closed', () => {
    renderPopover(false);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('should call onSelect with the correct emoji when clicked', () => {
    renderPopover();

    const thumbsUpButton = screen.getByLabelText(ReactionEmoji.ThumbsUp);
    fireEvent.click(thumbsUpButton);

    expect(onSelect).toHaveBeenCalledWith(ReactionEmoji.ThumbsUp);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('should call onSelect with heart emoji', () => {
    renderPopover();

    const heartButton = screen.getByLabelText(ReactionEmoji.Heart);
    fireEvent.click(heartButton);

    expect(onSelect).toHaveBeenCalledWith(ReactionEmoji.Heart);
  });

  it('should call onClose when clicking the backdrop', () => {
    renderPopover();

    const presentation = screen.getByRole('presentation');
    // eslint-disable-next-line testing-library/no-node-access
    fireEvent.click(presentation.firstChild!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when pressing Escape', () => {
    renderPopover();

    fireEvent.keyDown(screen.getByRole('group'), { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });

  it('should have a group role with accessible label', () => {
    renderPopover();

    const group = screen.getByRole('group', { name: 'Reactions' });
    expect(group).toBeInTheDocument();
  });

  it('should have aria-labels on each emoji button', () => {
    renderPopover();

    Object.values(ReactionEmoji).forEach((emoji) => {
      expect(screen.getByLabelText(emoji)).toBeInTheDocument();
    });
  });
});
