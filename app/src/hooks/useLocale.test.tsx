// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { renderHook, waitFor } from '@testing-library/react';
import { de } from 'date-fns/locale/de';
import { enUS } from 'date-fns/locale/en-US';
import { useTranslation } from 'react-i18next';
import { Mock } from 'vitest';

import useLocale from './useLocale';

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

describe('useLocale', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns enUS locale for English', async () => {
    const useTranslationSpy = useTranslation;
    (useTranslationSpy as Mock).mockReturnValue({
      t: (i18nKey: string) => i18nKey,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
        language: {
          split: () => ['en'],
        },
      },
    });
    const { result } = renderHook(() => useLocale());

    await waitFor(() => {
      expect(result.current).toBe(enUS);
    });
  });

  it('returns de locale for German', async () => {
    const useTranslationSpy = useTranslation;
    (useTranslationSpy as Mock).mockReturnValue({
      t: (i18nKey: string) => i18nKey,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
        language: {
          split: () => ['de'],
        },
      },
    });

    const { result } = renderHook(() => useLocale());

    await waitFor(() => {
      expect(result.current).toEqual(de);
    });
  });
});
