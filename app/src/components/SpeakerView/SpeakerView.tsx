// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack, Theme, styled, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';

import { useCinemaViewParticipants } from '../../hooks';
import { THUMBNAIL_WIDTH_LG, THUMBNAIL_WIDTH_XL } from './constants';
import Filmstrip from './fragments/Filmstrip';
import SpeakerWindow from './fragments/SpeakerWindow';

const Container = styled(Stack)(({ theme }) => ({
  width: '100%',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
  gap: theme.spacing(2),
}));

const SpeakerWindowContainer = styled('div')({
  overflow: 'hidden',
  flex: 1,
  minHeight: 0,
  justifyContent: 'center',
  alignContent: 'center',
  display: 'flex',
  flexDirection: 'column',
});

const SpeakerView = () => {
  const theme: Theme = useTheme();
  const thumbnailWidth = useMediaQuery(theme.breakpoints.up('xl')) ? THUMBNAIL_WIDTH_XL : THUMBNAIL_WIDTH_LG;
  const [visibleThumbnails, setVisibleThumbnails] = useState(1);
  const [speakerWindowDimensions, setSpeakerWindowDimensions] = useState({ width: 0, height: 0 });
  const { cinemaViewParticipants, remoteParticipantsMap, featuredTile } = useCinemaViewParticipants();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const speakerWindowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || !speakerWindowRef.current) {
      return;
    }

    const updateLayout = () => {
      const container = containerRef.current;
      const speakerWindow = speakerWindowRef.current;

      if (!container || !speakerWindow) {
        return;
      }

      const containerWidth = container.clientWidth;
      const qtyParticipants = Math.max(1, Math.floor(containerWidth / thumbnailWidth));
      setVisibleThumbnails(qtyParticipants);

      const { clientWidth, clientHeight } = speakerWindow;
      setSpeakerWindowDimensions({ width: clientWidth, height: clientHeight });
    };

    const observer = new ResizeObserver(() => {
      updateLayout();
    });

    observer.observe(containerRef.current);
    observer.observe(speakerWindowRef.current);

    updateLayout();

    return () => observer.disconnect();
  }, [thumbnailWidth]);

  return (
    <Container ref={containerRef} data-testid="SpeakerView-Container">
      <SpeakerWindowContainer ref={speakerWindowRef}>
        <SpeakerWindow
          speakerWindowWidth={speakerWindowDimensions.width}
          speakerWindowHeight={speakerWindowDimensions.height}
          cinemaViewParticipants={cinemaViewParticipants}
          remoteParticipantsMap={remoteParticipantsMap}
          featuredTile={featuredTile}
        />
      </SpeakerWindowContainer>
      <Filmstrip
        visibleThumbnails={visibleThumbnails}
        thumbnailWidth={thumbnailWidth}
        cinemaViewParticipants={cinemaViewParticipants}
        remoteParticipantsMap={remoteParticipantsMap}
        featuredTile={featuredTile}
      />
    </Container>
  );
};

export default SpeakerView;
