// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import React, { createContext } from 'react';

export type ExtendedFullScreenHandle = {
  node: React.RefObject<HTMLDivElement | null>;
  active: boolean;
  enter: (participantId?: string) => void;
  exit: () => void;
  hasActiveOverlay: boolean;
  setHasActiveOverlay: (hasActiveOverlay: boolean) => void;
  rootElement: HTMLElement | null;
  setRootElement: (element: HTMLElement | null) => void;
  isFullScreenAvailable: () => boolean;
};

export const FullscreenContext = createContext<ExtendedFullScreenHandle | null>(null);
