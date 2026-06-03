// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useTranslation } from 'react-i18next';

import { hotkeys } from '../store/slices/hotkeys/listener';

export const useHotkeyCombination = (descriptionKey: string) => {
  const { t } = useTranslation();

  const hotkey = hotkeys.find((hotkey) => hotkey.descriptionKey === descriptionKey);
  if (!hotkey) {
    return '';
  }
  const key = hotkey.key === ' ' ? t('global-spacebar') : hotkey.key.toUpperCase();
  const modifiers = hotkey.modifier ? [hotkey.modifier].flat() : [];
  const translatedModifiers = modifiers.map((modifier) => t(`modifier-${modifier.toLowerCase()}`));
  return [...translatedModifiers, key].join(' + ');
};
