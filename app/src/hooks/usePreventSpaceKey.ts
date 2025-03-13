// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useCallback, useEffect } from 'react';

import { useHotkeysActive } from './useHotkeys';

export function usePreventSpaceKey() {
  const hotkeysActive = useHotkeysActive();

  const preventSpaceKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.key === ' ') {
        const activeElement = document.activeElement;

        if (
          hotkeysActive &&
          activeElement &&
          (activeElement instanceof HTMLButtonElement ||
            activeElement.getAttribute('role') === 'menuitemradio' ||
            activeElement.getAttribute('role') === 'menuitem' ||
            activeElement.getAttribute('role') === 'button' ||
            activeElement.getAttribute('role') === 'combobox' ||
            activeElement.getAttribute('role') === 'option' ||
            (activeElement instanceof HTMLInputElement && activeElement.getAttribute('type') === 'checkbox'))
        ) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      }
    },
    [hotkeysActive]
  );

  useEffect(() => {
    document.addEventListener('keydown', preventSpaceKey, true);
    document.addEventListener('keyup', preventSpaceKey, true);
    document.addEventListener('keypress', preventSpaceKey, true);

    return () => {
      document.removeEventListener('keydown', preventSpaceKey, true);
      document.removeEventListener('keyup', preventSpaceKey, true);
      document.removeEventListener('keypress', preventSpaceKey, true);
    };
  }, [preventSpaceKey]);
}
