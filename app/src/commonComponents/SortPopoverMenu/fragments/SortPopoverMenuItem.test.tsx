// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuList } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';

import SortPopoverMenuItem from './SortPopoverMenuItem';

describe('<SortPopoverMenuItem />', () => {
  it('should render with required properties.', () => {
    render(
      <MenuList>
        <SortPopoverMenuItem i18nKey="test-key" value="test-value" onSelect={vi.fn()} />
      </MenuList>
    );
    expect(screen.getByRole('menuitem')).toBeInTheDocument();
  });

  it('should execute onSelect callback with value when clicked.', () => {
    const callback = vi.fn();
    render(
      <MenuList>
        <SortPopoverMenuItem i18nKey="test-key" value="test-value" onSelect={callback} selected={false} />
      </MenuList>
    );
    const li = screen.getByRole('menuitem');
    fireEvent.click(li);

    expect(callback).toHaveBeenCalledExactlyOnceWith('test-value');
  });
});
