// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { renderWithProviders, configureStore } from '../../../utils/testUtils';
import MoreButton from './MoreButton';

describe('<MoreButton />', () => {
  const { store } = configureStore();

  test('render MoreButton component', () => {
    renderWithProviders(<MoreButton />, { store, provider: { snackbar: true } });

    expect(screen.getByTestId('toolbarMenuButton')).toBeInTheDocument();
  });
});
