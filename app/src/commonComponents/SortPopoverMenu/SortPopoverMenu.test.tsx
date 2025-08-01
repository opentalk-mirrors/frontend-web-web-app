// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen } from '@testing-library/react';

import SortPopoverMenu from './SortPopoverMenu';

describe('<SortPopoverMenu />', () => {
  const DEFAULT_PROPS = {
    isOpen: true,
    onChange: vi.fn(),
    onSelect: vi.fn(),
    onClose: vi.fn(),
    selectedOptionType: '',
    items: [],
    id: '',
    anchorEl: document.createElement('div'),
  };

  afterEach(() => {
    DEFAULT_PROPS.onChange.mockClear();
    DEFAULT_PROPS.onSelect.mockClear();
    DEFAULT_PROPS.onClose.mockClear();
  });

  it('should render with mandatory properties.', () => {
    render(<SortPopoverMenu {...DEFAULT_PROPS} />);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('should render given items.', () => {
    const items = [
      { i18nKey: 'option-1', type: 'Option 1' },
      { i18nKey: 'option-2', type: 'Option 2' },
    ];
    const props = { ...DEFAULT_PROPS, items };
    render(<SortPopoverMenu {...props} />);

    const container = screen.getByRole('menu');

    expect(container).toContainElement(screen.getByText(items[0].i18nKey));
    expect(container).toContainElement(screen.getByText(items[1].i18nKey));
  });

  it('should execute onChange callback when option is selected.', () => {
    const items = [{ i18nKey: 'option-1', type: 'Option 1' }];
    const props = { ...DEFAULT_PROPS, items };

    render(<SortPopoverMenu {...props} />);

    fireEvent.click(screen.getByText(items[0].i18nKey));

    expect(DEFAULT_PROPS.onChange).toHaveBeenCalledWith(items[0].type);
  });
});
