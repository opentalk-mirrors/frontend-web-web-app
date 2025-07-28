// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent } from '@testing-library/react';

import { renderWithProviders } from '../../utils/testUtils';
import AccordionItem from './AccordionItem';

describe('AccordionItem', () => {
  const defaultProps = {
    onChange: vi.fn(),
    expanded: false,
    summaryText: 'Accordion summary',
    children: <div>Accordion details</div>,
  };

  it('renders the summary text and it is h3 by default', () => {
    renderWithProviders(<AccordionItem {...defaultProps} />, {
      provider: { mui: true },
    });
    expect(screen.getByText('Accordion summary')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('renders the summary as heading of custom level', () => {
    const LEVEL = 5;
    renderWithProviders(<AccordionItem {...defaultProps} headingComponent={`h${LEVEL}`} />, {
      provider: { mui: true },
    });
    expect(screen.getByRole('heading', { level: LEVEL })).toBeInTheDocument();
  });

  it('is not expanded by default', () => {
    renderWithProviders(<AccordionItem {...defaultProps} />, {
      provider: { mui: true },
    });
    expect(screen.getByText('Accordion details')).not.toBeVisible();
  });

  it('can be expanded', () => {
    renderWithProviders(<AccordionItem {...defaultProps} expanded={true} />, {
      provider: { mui: true },
    });
    expect(screen.getByText('Accordion details')).toBeVisible();
  });

  it('calls onChange when clicked', () => {
    renderWithProviders(<AccordionItem {...defaultProps} />, {
      provider: { mui: true },
    });
    const summary = screen.getByRole('button', { name: 'Accordion summary' });
    fireEvent.click(summary);
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it('renders the summary end adornment if provided', () => {
    renderWithProviders(<AccordionItem {...defaultProps} summaryEndAdornment={<div>Additional Component</div>} />, {
      provider: { mui: true },
    });
    expect(screen.getByText('Additional Component')).toBeInTheDocument();
  });
});
