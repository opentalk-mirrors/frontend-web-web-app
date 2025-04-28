// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen, render } from '@testing-library/react';

import { SortOption } from '../../types';
import TalkingStickSortButton from './TalkingStickSortButton';

describe('TalkingStickSortButton', () => {
  const DEFAULT_PROPS = {
    selectedSortType: SortOption.NameASC,
    onChange: jest.fn(),
  };

  afterEach(() => {
    DEFAULT_PROPS.onChange.mockClear();
  });

  it('should reveal sort popover when button is clicked.', () => {
    render(<TalkingStickSortButton {...DEFAULT_PROPS} />);
    const button = screen.getByText('sort-name-asc');
    fireEvent.click(button);

    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});
