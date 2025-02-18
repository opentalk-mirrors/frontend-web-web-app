// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen } from '@testing-library/react';

/**
 * Mocking react-i18next module as we don't care about actual
 * text in the snapshots, we only want to be sure that used key
 * is not going to change.
 */
import SortPopoverMenuItem from './SortPopoverMenuItem';

describe('<SortPopoverMenuItem />', () => {
  test('should render with required properties.', () => {
    render(<SortPopoverMenuItem i18nKey="test-key" value="test-value" onSelect={jest.fn()} />);
  });

  test('should execute onSelect callback with value when clicked.', () => {
    const callback = jest.fn();
    render(<SortPopoverMenuItem i18nKey="test-key" value="test-value" onSelect={callback} selected={false} />);
    const li = screen.getByRole('menuitem');
    fireEvent.click(li);

    expect(callback).toHaveBeenCalledWith('test-value');
  });
});
