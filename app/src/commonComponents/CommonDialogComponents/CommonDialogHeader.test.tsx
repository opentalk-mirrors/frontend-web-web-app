// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import CommonDialogHeader from './CommonDialogHeader';

const mockClose = vi.fn();

describe('CommonDialogHeader', () => {
  it('renders CommonDialogHeader component with title and close button', () => {
    render(<CommonDialogHeader closeMenu={mockClose} titleKey="test-title" />);

    expect(screen.getByText('test-title')).toBeInTheDocument();
    expect(screen.getByLabelText('global-close-dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'global-close-dialog' })).toBeInTheDocument();
  });
  it('calls closeMenu function when close button is clicked', () => {
    render(<CommonDialogHeader closeMenu={mockClose} titleKey="test-title" />);

    const closeButton = screen.getByRole('button', { name: 'global-close-dialog' });
    closeButton.click();

    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
