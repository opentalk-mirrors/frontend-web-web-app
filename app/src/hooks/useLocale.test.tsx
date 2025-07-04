// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { renderHook, act } from '@testing-library/react';
import { de } from 'date-fns/locale/de';
import { enUS } from 'date-fns/locale/en-US';
import { useTranslation } from 'react-i18next';

import useLocale from './useLocale';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

/**
 * @jest-environment @happy-dom/jest-environment
 *
 * Its needed because js-dom does not support throwIfAborted which is used in the useLocale hook.
 * This will just be used for this specific test suite.
 * */
describe('useLocale', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns enUS locale for English', async () => {
    const useTranslationSpy = useTranslation;
    (useTranslationSpy as jest.Mock).mockReturnValue({
      t: (i18nKey: string) => i18nKey,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
        language: {
          split: () => ['en'],
        },
      },
    });
    const { result } = renderHook(() => useLocale());

    // Wait for useEffect to run
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toBe(enUS);
  });

  it('returns de locale for German', async () => {
    const useTranslationSpy = useTranslation;
    (useTranslationSpy as jest.Mock).mockReturnValue({
      t: (i18nKey: string) => i18nKey,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
        language: {
          split: () => ['de'],
        },
      },
    });

    const { result } = renderHook(() => useLocale());

    // Wait for useEffect to run
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toEqual(de);
  });
});
