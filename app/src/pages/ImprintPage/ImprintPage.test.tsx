// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import { useUpdateDocumentTitle } from '../../hooks/useUpdateDocumentTitle';
import { ImprintPage } from './ImprintPage';

jest.mock('../../hooks/useUpdateDocumentTitle', () => ({
  useUpdateDocumentTitle: jest.fn(),
}));

describe('ImprintPage', () => {
  it('renders without crash', () => {
    render(<ImprintPage />);

    expect(screen.getByRole('heading', { name: 'dashboard-legal-imprint' })).toBeInTheDocument();
    expect(useUpdateDocumentTitle).toHaveBeenCalledTimes(1);
    expect(useUpdateDocumentTitle).toHaveBeenCalledWith('dashboard-legal-imprint');
  });
});
