// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render } from '@testing-library/react';

import { MeetingHeaderButton } from './MeetingHeaderButton';

describe('MeetingHeaderButton', () => {
  it('should render without crashing', () => {
    expect(() => render(<MeetingHeaderButton />)).not.toThrow();
    expect(() => render(<MeetingHeaderButton active />)).not.toThrow();
  });
});
