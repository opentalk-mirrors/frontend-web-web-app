// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, fireEvent } from '@testing-library/react';

import AccordionItem from './AccordionItem';

describe('AccordionItem', () => {
  const defaultProps = {
    onChange: jest.fn(),
    expanded: false,
    summaryText: 'Accordion summary',
    children: <div>Accordion details</div>,
  };

  it('renders the summary text and it is h3 by default', () => {
    render(<AccordionItem {...defaultProps} />);
    expect(screen.getByText('Accordion summary')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('renders the summary as heading of custom level', () => {
    const LEVEL = 5;
    render(<AccordionItem {...defaultProps} headingComponent={`h${LEVEL}`} />);
    expect(screen.getByRole('heading', { level: LEVEL })).toBeInTheDocument();
  });

  it('is not expanded by default', () => {
    render(<AccordionItem {...defaultProps} />);
    expect(screen.getByText('Accordion details')).not.toBeVisible();
  });

  it('can be expanded', () => {
    render(<AccordionItem {...defaultProps} expanded={true} />);
    expect(screen.getByText('Accordion details')).toBeVisible();
  });

  it('calls onChange when clicked', () => {
    render(<AccordionItem {...defaultProps} />);
    const summary = screen.getByRole('button', { name: 'Accordion summary' });
    fireEvent.click(summary);
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it('renders the summary end adornment if provided', () => {
    render(<AccordionItem {...defaultProps} summaryEndAdornment={<div>Additional Component</div>} />);
    expect(screen.getByText('Additional Component')).toBeInTheDocument();
  });
});
