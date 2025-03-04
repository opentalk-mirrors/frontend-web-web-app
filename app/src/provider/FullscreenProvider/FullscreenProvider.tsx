// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { sortParticipants } from '@livekit/components-core';
import fscreen from 'fscreen';
import { Participant, RemoteParticipant } from 'livekit-client';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { getLivekitRoom } from '../../store/livekitRoom';
import { FullscreenContext } from './FullscreenContext';

const FullscreenProvider = ({ children }: { children: ReactNode }) => {
  const node = useRef<HTMLDivElement | null>(null);
  const [fullscreenParticipant, setFullscreenParticipant] = useState<Participant | undefined>(undefined);
  const [rootElement, setRootElement] = useState<HTMLElement | null>(document?.body ?? null);
  const [active, setActive] = useState<boolean>(false);
  const [hasActiveOverlay, setHasActiveOverlay] = useState<boolean>(false);

  const enter = useCallback((participant?: RemoteParticipant) => {
    const room = getLivekitRoom();
    if (node.current && room) {
      const remoteParticipant = sortParticipants(Array.from(room.remoteParticipants.values()))?.[0];
      setFullscreenParticipant(participant ? participant : remoteParticipant);
      return fscreen.requestFullscreen(node.current);
    }
  }, []);

  const exit = useCallback(() => {
    return fscreen.exitFullscreen();
  }, []);

  useEffect(() => {
    const handleChange = () => {
      setActive(Boolean(fscreen.fullscreenElement));
    };
    fscreen.addEventListener('fullscreenchange', handleChange);
    return () => fscreen.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const extendedFullscreenHandle = {
    node,
    active,
    enter,
    exit,
    fullscreenParticipant,
    hasActiveOverlay,
    setHasActiveOverlay,
    rootElement,
    setRootElement,
  };

  return <FullscreenContext.Provider value={extendedFullscreenHandle}>{children}</FullscreenContext.Provider>;
};

export default FullscreenProvider;
