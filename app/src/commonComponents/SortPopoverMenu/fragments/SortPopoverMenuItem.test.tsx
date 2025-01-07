// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen, waitFor } from '../../../utils/testUtils';

/**
 * Mocking react-i18next module as we don't care about actual
 * text in the snapshots, we only want to be sure that used key
 * is not going to change.
 */
import SortPopoverMenuItem from './SortPopoverMenuItem';

describe('<SortPopoverMenuItem />', () => {
  it('should render with required properties.', async () => {
    await render(<SortPopoverMenuItem i18nKey="test-key" value="test-value" onSelect={jest.fn()} />);
  });

  it('should execute onSelect callback with value when clicked.', async () => {
    const callback = jest.fn();
    await render(<SortPopoverMenuItem i18nKey="test-key" value="test-value" onSelect={callback} selected={false} />);
    const li = screen.getByRole('menuitem');
    fireEvent.click(li);

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith('test-value');
    });
  });
});
