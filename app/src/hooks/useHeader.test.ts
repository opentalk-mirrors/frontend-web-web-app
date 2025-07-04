// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { renderHook } from '@testing-library/react';
import { useOutletContext } from 'react-router-dom';

import { useHeader } from './useHeader';

jest.mock('react-router-dom', () => ({
  useOutletContext: jest.fn(),
}));

describe('useHeader', () => {
  it('should return the header context from useOutletContext', () => {
    const mockContext = {
      header: '<div>Mock Header</div>',
      setHeader: jest.fn(),
    };

    (useOutletContext as jest.Mock).mockReturnValue(mockContext);

    const { result } = renderHook(() => useHeader());

    expect(result.current).toBe(mockContext);
    expect(result.current.header).toEqual(mockContext.header);
    expect(result.current.setHeader).toBe(mockContext.setHeader);
  });
});
