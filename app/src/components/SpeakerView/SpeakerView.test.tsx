// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, cleanup } from '@testing-library/react';

import SpeakerView from '.';
import { renderWithProviders, mockStore } from '../../utils/testUtils';

jest.mock('./fragments/SpeakerWindow', () => ({
  __esModule: true,
  default: () => <div></div>,
}));

jest.mock('./fragments/ThumbsRow', () => ({
  __esModule: true,
  default: () => <div></div>,
}));

describe('SpeakerView', () => {
  afterEach(cleanup);

  it('renders SpeakerView correctly', () => {
    const { store } = mockStore(0);
    renderWithProviders(<SpeakerView />, { store });

    // Initial elements appear
    expect(screen.getByTestId('SpeakerView-Container')).toBeInTheDocument();
  });
});
