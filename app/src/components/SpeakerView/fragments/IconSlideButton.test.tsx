// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, fireEvent } from '@testing-library/react';

import IconSlideButton from './IconSlideButton';

describe('IconSlideButton', () => {
  it('renders right IconSlideButton correctly', () => {
    const slideRight = vi.fn();

    render(<IconSlideButton direction="right" onClick={slideRight} />);

    const navRightButton = screen.getByLabelText('navigate-to-right');
    expect(navRightButton).toBeInTheDocument();

    fireEvent.click(navRightButton);

    expect(slideRight).toHaveBeenCalled();
  });

  it('renders left IconSlideButton correctly', () => {
    const slideLeft = vi.fn();

    render(<IconSlideButton direction="left" onClick={slideLeft} />);

    const navLeftButton = screen.getByLabelText('navigate-to-left');

    expect(navLeftButton).toBeInTheDocument();

    fireEvent.click(navLeftButton);

    expect(slideLeft).toHaveBeenCalled();
  });
});
