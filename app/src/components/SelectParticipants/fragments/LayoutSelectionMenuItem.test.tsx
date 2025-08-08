// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, fireEvent } from '@testing-library/react';

import LayoutSelectionMenuItem from './LayoutSelectionMenuItem';

describe('LayoutSelectionMenuItem', () => {
  it('renders content text', () => {
    render(<LayoutSelectionMenuItem content="test content" />);
    expect(screen.getByText('test content')).toBeInTheDocument();
  });

  it('renders check icon when showCheckIcon is true', () => {
    render(<LayoutSelectionMenuItem content="with check" showCheckIcon />);
    expect(screen.getByTestId('CheckIcon')).toBeInTheDocument();
  });

  it('does not render check icon when showCheckIcon is false', () => {
    render(<LayoutSelectionMenuItem content="without check" />);
    expect(screen.queryByTestId('CheckIcon')).toBeNull();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<LayoutSelectionMenuItem content="click me" onClick={handleClick} />);
    fireEvent.click(screen.getByRole('menuitemradio'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('renders custom icon if provided', () => {
    const CustomIcon = () => <svg data-testid="CustomIcon" />;
    render(<LayoutSelectionMenuItem content="with icon" icon={<CustomIcon />} />);
    expect(screen.getByTestId('CustomIcon')).toBeInTheDocument();
  });

  it('sets aria-checked to true if showCheckIcon is true', () => {
    render(<LayoutSelectionMenuItem content="aria checked" showCheckIcon />);
    expect(screen.getByRole('menuitemradio')).toHaveAttribute('aria-checked', 'true');
  });

  it('sets aria-checked to false if showCheckIcon is false', () => {
    render(<LayoutSelectionMenuItem content="aria unchecked" />);
    expect(screen.getByRole('menuitemradio')).toHaveAttribute('aria-checked', 'false');
  });
});
