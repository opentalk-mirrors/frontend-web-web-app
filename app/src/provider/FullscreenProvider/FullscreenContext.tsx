// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RemoteParticipant, Participant } from 'livekit-client';
import React, { createContext } from 'react';

export type ExtendedFullScreenHandle = {
  node: React.MutableRefObject<HTMLDivElement | null>;
  active: boolean;
  enter: (participant?: RemoteParticipant) => void;
  exit: () => void;
  fullscreenParticipant: Participant | undefined;
  hasActiveOverlay: boolean;
  setHasActiveOverlay: (hasActiveOverlay: boolean) => void;
  rootElement: HTMLElement | null;
  setRootElement: (element: HTMLElement | null) => void;
};

export const FullscreenContext = createContext<ExtendedFullScreenHandle | null>(null);
