// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { renderHook, waitFor } from '@testing-library/react';

import { useUpdateDocumentTitle } from './useUpdateDocumentTitle';

describe('useUpdateDocumentTitle', () => {
  beforeEach(() => {
    document.title = 'Initial Title';
  });

  it('sets the document title with the default extension', async () => {
    renderHook(() => useUpdateDocumentTitle('Dashboard'));

    await waitFor(() => {
      expect(document.title).toBe('Dashboard in OpenTalk');
    });
  });

  it('updates the document title when the title changes', async () => {
    const { rerender } = renderHook(({ title }) => useUpdateDocumentTitle(title), {
      initialProps: { title: 'First Title' },
    });

    await waitFor(() => {
      expect(document.title).toBe('First Title in OpenTalk');
    });

    rerender({ title: 'Second Title' });

    await waitFor(() => {
      expect(document.title).toBe('Second Title in OpenTalk');
    });
  });

  it('applies a custom extension when provided', async () => {
    renderHook(() => useUpdateDocumentTitle('Settings', { extension: ' | K3K' }));

    await waitFor(() => {
      expect(document.title).toBe('Settings | K3K');
    });
  });
});
