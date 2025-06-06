// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen } from '@testing-library/react';

import LegalContainer from './LegalContainer';

describe('LegalContainer', () => {
  it('renders font awesome license item', () => {
    render(<LegalContainer />);
    expect(screen.getByText('font-awesome-license')).toBeInTheDocument();
  });

  it('shows font awesome license', () => {
    render(<LegalContainer />);
    const item = screen.getByText('font-awesome-license');
    fireEvent.click(item);
    expect(screen.getByText('Font Awesome License')).toBeInTheDocument();
  });
});
