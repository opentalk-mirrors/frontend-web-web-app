// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import { useUpdateDocumentTitle } from '../../hooks/useUpdateDocumentTitle';
import { SupportPage } from './SupportPage';

jest.mock('../../hooks/useUpdateDocumentTitle', () => ({
  useUpdateDocumentTitle: jest.fn(),
}));

describe('SupportPage', () => {
  test('renders without crash', () => {
    render(<SupportPage />);

    expect(screen.getByRole('heading', { name: 'dashboard-help-support' })).toBeInTheDocument();
    expect(useUpdateDocumentTitle).toHaveBeenCalledTimes(1);
    expect(useUpdateDocumentTitle).toHaveBeenCalledWith('dashboard-help-support');
  });
});
