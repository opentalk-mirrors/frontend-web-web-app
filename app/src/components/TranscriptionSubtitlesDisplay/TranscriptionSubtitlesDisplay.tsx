// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { CloseIcon, SettingsIcon } from '../../assets/icons';
import { ParticipantAvatar } from '../../commonComponents';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  hideSubtitles,
  removeExpiredSegments,
  selectShowSubtitles,
  selectSubtitles,
  showTranscriptionSettings,
  TranscriptionSubtitle,
} from '../../store/slices/transcriptionSlice';
import { selectIsModerator } from '../../store/slices/userSlice';

const SubtitlesContainer = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(-2),
  background: theme.palette.background.customPaper.primary,
  color: theme.palette.background.main.contrastText,
  borderRadius: theme.borderRadius.medium,
  position: 'relative',
  gap: theme.spacing(2),
  margin: '0 auto',
  height: theme.spacing(22),
  overflowY: 'scroll',
  scrollbarWidth: 'none',
  width: '100%',
  userSelect: 'none',
  boxShadow: '0 12px 12px 0 rgb(0 0 0 / 16%)',
}));

const Subtitle = styled(Box)(({ theme }) => ({
  width: `calc(100% - ${theme.spacing(8)})`,
  display: 'flex',
}));

const DisplayName = styled(Typography)(({ theme }) => ({
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  width: theme.spacing(14),
}));

const SubtitlesContainerHeader = styled('div')({
  userSelect: 'none',
  position: 'absolute',
  top: 0,
  right: 0,
});

const REFRESH_INTERVAL = 1000;
const TranscriptionSubtitlesDisplay = () => {
  const activeSubtitles = useAppSelector(selectSubtitles);
  const subtitlesEnabled = useAppSelector(selectShowSubtitles);
  const isModerator = useAppSelector(selectIsModerator);
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(removeExpiredSegments(new Date().toISOString()));
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [dispatch]);

  const closeDisplay = () => {
    dispatch(hideSubtitles());
  };

  const showSettings = () => {
    dispatch(showTranscriptionSettings());
  };

  return (
    subtitlesEnabled && (
      <>
        <SubtitlesContainer>
          <SubtitlesContainerHeader>
            {isModerator && (
              <Tooltip title={t('more-menu-subtitle-settings')}>
                <IconButton onClick={showSettings}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={t('more-menu-hide-subtitles')}>
              <IconButton onClick={closeDisplay}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </SubtitlesContainerHeader>
          {activeSubtitles.length > 0 ? (
            activeSubtitles.map((subtitle: TranscriptionSubtitle) => (
              <Subtitle key={`${subtitle.displayName}-${subtitle.timestamp}`}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <ParticipantAvatar src={subtitle.avatarUrl} alt={subtitle.displayName} />
                  <Box>
                    <DisplayName variant="body2">{subtitle.displayName}</DisplayName>
                  </Box>
                  <Typography>{subtitle.text}</Typography>
                </Stack>
              </Subtitle>
            ))
          ) : (
            <Subtitle>
              <Typography>{t('subtitle-silence-placeholder')}</Typography>
            </Subtitle>
          )}
        </SubtitlesContainer>
      </>
    )
  );
};

export default TranscriptionSubtitlesDisplay;
