// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import { renderWithProviders, configureStore } from '../../../utils/testUtils';
import HandraiseButton from './HandraiseButton';

describe('<HandraiseButton />', () => {
  const { store, dispatchSpy } = configureStore();

  it('should render HandraiseButton component', () => {
    renderWithProviders(<HandraiseButton />, { store, provider: { mui: true } });

    expect(screen.getByTestId('toolbarHandraiseButton')).toBeInTheDocument();
  });

  it('should dispatch raise_hand by clicking on HandraiseButton', () => {
    renderWithProviders(<HandraiseButton />, { store, provider: { mui: true } });
    const endButton = screen.getByTestId('toolbarHandraiseButton');
    expect(endButton).toBeInTheDocument();

    fireEvent.click(endButton);

    expect(dispatchSpy.mock.calls).toContainEqual([{ payload: undefined, type: 'signaling/control/raise_hand' }]);
  });
});
