// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mock } from 'vitest';

import { useGetMeQuery } from '../../../../api/rest';
import { configureStore, renderWithProviders } from '../../../../utils/testUtils';
import { PaymentStatusBanner } from './PaymentStatusBanner';

vi.mock('../../../../api/rest', async (importOriginal) => ({
  ...(await importOriginal()),
  useGetMeTariffQuery: () => ({
    data: {
      name: 'OpenTalkStandard',
    },
  }),
  useGetMeQuery: vi.fn(),
}));

const mockUseGetMeQuery = useGetMeQuery as Mock;

const ACCOUNT_MANAGEMENT_URL = 'account.management.url';
const { store } = configureStore({
  initialState: {
    config: { provider: { accountManagementUrl: ACCOUNT_MANAGEMENT_URL } },
  },
});

describe('Payment Status Banner', () => {
  it('shows nothing for default tariff', () => {
    mockUseGetMeQuery.mockImplementation(() => ({
      data: {
        tariffStatus: 'default',
      },
    }));

    renderWithProviders(<PaymentStatusBanner />, { store });
    expect(screen.queryByText(/./)).not.toBeInTheDocument();
  });
  it('shows payment status warning for downgraded tariff and navigates user to payment administration on button click', async () => {
    mockUseGetMeQuery.mockImplementation(() => ({
      data: {
        tariffStatus: 'downgraded',
      },
    }));

    // mock window.open
    const jsdomOpen = window.open;
    window.open = vi.fn();

    renderWithProviders(<PaymentStatusBanner />, { store, provider: { mui: true } });
    expect(screen.getByText('dashboard-payment-status-downgraded')).toBeInTheDocument();

    const addPaymentButton = screen.getByRole('button', { name: 'dashboard-add-payment-button' });
    await userEvent.click(addPaymentButton);
    expect(window.open).toHaveBeenCalledExactlyOnceWith(ACCOUNT_MANAGEMENT_URL, '_self');

    // restore window.open
    window.open = jsdomOpen;
  });
});
