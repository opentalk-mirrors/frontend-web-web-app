// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import VisuallyHiddenTitle from './VisuallyHiddenTitle';

describe('Visually Hidden Title', () => {
  test('should render as the given component', () => {
    render(<VisuallyHiddenTitle component="h2" label="messages" />);

    const renderedVisuallyHiddenTitle = screen.getByRole('heading');
    expect(renderedVisuallyHiddenTitle).toBeInTheDocument();
    expect(renderedVisuallyHiddenTitle.tagName).toBe('H2');
  });
});
