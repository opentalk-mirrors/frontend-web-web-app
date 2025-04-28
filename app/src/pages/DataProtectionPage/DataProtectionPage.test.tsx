// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import { useUpdateDocumentTitle } from '../../hooks/useUpdateDocumentTitle';
import { DataProtectionPage } from './DataProtectionPage';

jest.mock('../../hooks/useUpdateDocumentTitle', () => ({
  useUpdateDocumentTitle: jest.fn(),
}));

describe('DataProtectionPage', () => {
  it('renders without crash', () => {
    render(<DataProtectionPage />);

    expect(screen.getByRole('heading', { name: 'dashboard-legal-data-protection' })).toBeInTheDocument();
    expect(useUpdateDocumentTitle).toHaveBeenCalledTimes(1);
    expect(useUpdateDocumentTitle).toHaveBeenCalledWith('dashboard-legal-data-protection');
  });
});
