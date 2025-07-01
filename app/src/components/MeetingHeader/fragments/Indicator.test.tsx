// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render } from '@testing-library/react';

import { Indicator } from './Indicator';

describe('Indicator', () => {
  it('should render without crashing', () => {
    expect(() => render(<Indicator />)).not.toThrow();
  });
});
