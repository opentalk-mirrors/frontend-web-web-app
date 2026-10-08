// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createContext, useContext } from 'react';

interface SelfViewAnchorValue {
  anchor: HTMLElement | null;
  setAnchor: (el: HTMLElement | null) => void;
}

const SelfViewAnchorContext = createContext<SelfViewAnchorValue>({
  anchor: null,
  setAnchor: () => {},
});

export function useSelfViewAnchor() {
  return useContext(SelfViewAnchorContext);
}

export default SelfViewAnchorContext;
