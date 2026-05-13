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
  gap: theme.spacing(2),
}));

const SpeakerWindowContainer = styled('div')({
  overflow: 'hidden',
  flex: 1,
  justifyContent: 'center',
  alignContent: 'center',
  display: 'flex',
  flexDirection: 'column',
});

const SpeakerView = () => {
  const theme: Theme = useTheme();
  const thumbWidth = useMediaQuery(theme.breakpoints.up('xl')) ? THUMB_WIDTH_XL : THUMB_WIDTH_LG;
  const [thumbsPerPage, setThumbsPerPage] = useState(1);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const updateLayout = () => {
      const container = containerRef.current;

      if (!container) {
        return;
      }

      const containerWidth = container.clientWidth;
      const qtyParticipants = Math.max(1, Math.floor(containerWidth / thumbWidth));
      setThumbsPerPage(qtyParticipants);
    };

    const observer = new ResizeObserver(() => {
      updateLayout();
    });

    observer.observe(containerRef.current);

    updateLayout();

    return () => observer.disconnect();
  }, [thumbWidth]);

  return (
    <Container ref={containerRef} data-testid="SpeakerView-Container">
      <SpeakerWindowContainer>
        <SpeakerWindow />
      </SpeakerWindowContainer>
      <ThumbsRow thumbsPerWindow={thumbsPerPage} thumbWidth={thumbWidth} />
    </Container>
  );
};

export default SpeakerView;
