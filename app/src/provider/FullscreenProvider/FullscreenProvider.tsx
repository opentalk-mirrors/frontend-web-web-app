// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import fscreen from 'fscreen';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { useAppDispatch } from '../../hooks/useCustomRedux';
import { pinnedParticipantIdSet } from '../../store/slices/uiSlice';
import { ParticipantId } from '../../types';
import { FullscreenContext } from './FullscreenContext';

const FullscreenProvider = ({ children }: { children: ReactNode }) => {
  const node = useRef<HTMLDivElement | null>(null);
  const [rootElement, setRootElement] = useState<HTMLElement | null>(document?.body ?? null);
  const [active, setActive] = useState<boolean>(false);
  const [hasActiveOverlay, setHasActiveOverlay] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const enter = useCallback(
    (participantId?: string) => {
      if (node.current) {
        if (participantId) {
          dispatch(pinnedParticipantIdSet(participantId as ParticipantId));
        }
        return fscreen.requestFullscreen(node.current);
      }
    },
    [dispatch]
  );

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

  const isFullScreenAvailable = () => {
    return Boolean(node.current?.requestFullscreen);
  };

  const extendedFullscreenHandle = {
    node,
    active,
    enter,
    exit,
    hasActiveOverlay,
    setHasActiveOverlay,
    rootElement,
    setRootElement,
    isFullScreenAvailable,
  };

  return <FullscreenContext.Provider value={extendedFullscreenHandle}>{children}</FullscreenContext.Provider>;
};

export default FullscreenProvider;
