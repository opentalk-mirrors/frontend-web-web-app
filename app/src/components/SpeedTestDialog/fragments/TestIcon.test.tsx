// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, within } from '@testing-library/react';

import TestIcon from './TestIcon';

describe('TestIcon', () => {
  it('renders the svg with expected layers', () => {
    render(<TestIcon animated={false} aria-label="speed-icon" />);

    const svg = screen.getByLabelText('speed-icon');
    const view = within(svg);

    expect(svg).toBeInTheDocument();
    expect(svg).not.toHaveAttribute('animated');
    expect(view.getByTestId('outer-path')).toBeInTheDocument();
    expect(view.getByTestId('middle-path')).toBeInTheDocument();
    expect(view.getByTestId('inner-path')).toBeInTheDocument();
  });

  it('applies animations when animated is true', () => {
    render(<TestIcon animated aria-label="speed-icon" />);

    const svg = screen.getByLabelText('speed-icon');
    const view = within(svg);
    const outer = view.getByTestId('outer-path');
    const middle = view.getByTestId('middle-path');
    const inner = view.getByTestId('inner-path');

    expect(getComputedStyle(outer).animationDuration).not.toBe('0s');
    expect(getComputedStyle(middle).animationDuration).not.toBe('0s');
    expect(getComputedStyle(inner).animationDuration).not.toBe('0s');
  });
});
