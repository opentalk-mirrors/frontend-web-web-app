// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import { renderWithProviders } from '../../../../utils/testUtils';
import PageIndex from './PageIndex';

describe('PageIndex callback logic', () => {
  it('should call handleClick when clicked', () => {
    const handleClick = vi.fn();
    renderWithProviders(<PageIndex index={1} handleClick={handleClick} />, { provider: { mui: true } });
    fireEvent.click(screen.getByText('1'));
    expect(handleClick).toHaveBeenCalled();
  });
});
