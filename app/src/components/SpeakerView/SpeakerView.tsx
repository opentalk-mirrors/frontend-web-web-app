// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack, Theme, styled, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';

import { THUMB_WIDTH_LG, THUMB_WIDTH_XL } from './constants';
import SpeakerWindow from './fragments/SpeakerWindow';
import ThumbsRow from './fragments/ThumbsRow';

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
  const thumbWidth = useMediaQuery(theme.breakpoints.up('xl')) ? THUMB_WIDTH_XL : THUMB_WIDTH_LG;
  const [thumbsPerPage, setThumbsPerPage] = useState(1);
  const [speakerWindowDimensions, setSpeakerWindowDimensions] = useState({ width: 0, height: 0 });

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
      const qtyParticipants = Math.max(1, Math.floor(containerWidth / thumbWidth));
      setThumbsPerPage(qtyParticipants);

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
  }, [thumbWidth]);

  return (
    <Container ref={containerRef} data-testid="SpeakerView-Container">
      <SpeakerWindowContainer ref={speakerWindowRef}>
        <SpeakerWindow
          speakerWindowWidth={speakerWindowDimensions.width}
          speakerWindowHeight={speakerWindowDimensions.height}
        />
      </SpeakerWindowContainer>
      <ThumbsRow thumbsPerWindow={thumbsPerPage} thumbWidth={thumbWidth} />
    </Container>
  );
};

export default SpeakerView;
