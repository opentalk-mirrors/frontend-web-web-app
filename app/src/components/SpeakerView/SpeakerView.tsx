// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack, Theme, styled, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { debounce } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';

import SpeakerWindow from './fragments/SpeakerWindow';
import ThumbsRow from './fragments/ThumbsRow';

const Container = styled(Stack)({
  width: '100%',
  flexDirection: 'column',
  height: '100%',
});

const SpeakerWindowContainer = styled('div')({
  overflow: 'hidden',
  display: 'flex',
  height: '100%',
  justifyContent: 'center',
  alignContent: 'center',
});

const SpeakerView = () => {
  const theme: Theme = useTheme();
  const thumbWidth = useMediaQuery(theme.breakpoints.up('xl')) ? 340 : 240;
  const [thumbsPerPage, setThumbsPerPage] = useState(1);
  const [{ width, height }, setWindowSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const speakerWindowRef = useRef<HTMLDivElement | null>(null);
  const speakerWindowWidth = speakerWindowRef?.current?.clientWidth;
  const speakerWindowHeight = speakerWindowRef?.current?.clientHeight;

  const handleResize = useCallback(() => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const qtyParticipants = Math.max(1, Math.floor(containerWidth / thumbWidth));
      setThumbsPerPage(qtyParticipants);
    }

    if (windowHeight !== height && windowWidth !== width) {
      setWindowSize({ width: windowHeight, height: windowWidth });
    }
  }, [thumbWidth, height, width]);

  useEffect(() => {
    const debouncedHandleResize = debounce(handleResize);

    debouncedHandleResize();
    window.addEventListener('resize', debouncedHandleResize);
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, [handleResize]);

  return (
    <Container ref={containerRef} data-testid="SpeakerView-Container">
      <SpeakerWindowContainer ref={speakerWindowRef}>
        <SpeakerWindow speakerWindowWidth={speakerWindowWidth} speakerWindowHeight={speakerWindowHeight} />
      </SpeakerWindowContainer>
      <ThumbsRow thumbsPerWindow={thumbsPerPage} thumbWidth={thumbWidth} />
    </Container>
  );
};

export default SpeakerView;
