// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../../utils/testUtils';
import LayoutSelectionMenuItem from './LayoutSelectionMenuItem';

describe('LayoutSelectionMenuItem', () => {
  it('renders content text', () => {
    render(<LayoutSelectionMenuItem content="test content" />);
    expect(screen.getByText('test content')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<LayoutSelectionMenuItem content="click me" onClick={handleClick} />);
    await user.click(screen.getByRole('menuitemradio'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('renders custom icon if provided', () => {
    const CustomIcon = () => <svg data-testid="CustomIcon" />;
    render(<LayoutSelectionMenuItem content="with icon" icon={<CustomIcon />} />);
    expect(screen.getByTestId('CustomIcon')).toBeInTheDocument();
  });

  it('sets aria-checked to true if it is selected', () => {
    renderWithProviders(<LayoutSelectionMenuItem content="aria checked" isSelected />, { provider: { mui: true } });
    expect(screen.getByRole('menuitemradio', { checked: true })).toBeInTheDocument();
  });

  it('sets aria-checked to false if showCheckIcon is false', () => {
    render(<LayoutSelectionMenuItem content="aria unchecked" />);
    expect(screen.queryByRole('menuitemradio', { checked: true })).not.toBeInTheDocument();
  });
});
