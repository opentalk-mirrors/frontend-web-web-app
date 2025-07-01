// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen } from '@testing-library/react';

import PageIndex from './PageIndex';

describe('PageIndex callback logic', () => {
  it('should call handleClick when clicked', () => {
    const handleClick = jest.fn();
    render(<PageIndex index={1} handleClick={handleClick} />);
    fireEvent.click(screen.getByText('1'));
    expect(handleClick).toHaveBeenCalled();
  });
});
