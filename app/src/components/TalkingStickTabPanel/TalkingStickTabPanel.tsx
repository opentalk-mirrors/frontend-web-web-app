// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, Stack, Typography } from '@mui/material';
import { memo, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { selectNext, talkingStickStart, stop as talkingStickStop } from '../../api/types/outgoing/automod';
import { CommonSwitch } from '../../commonComponents';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectCombinedUserAndParticipants } from '../../store/selectors';
import { selectAutomodActiveState, selectAutomoderationParticipantIds } from '../../store/slices/automodSlice';
import { SortOption } from '../../types';
import { sortParticipantsWithConfig } from '../../utils/sortParticipants';
import { TalkingStickParticipantList } from '../TalkingStickParticipantList';
import { TalkingStickSortButton } from '../TalkingStickSortButton';

const INCLUDE_MODERATOR_ID = 'include-moderator-label';

const TalkingStickTabPanel = () => {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  const configurationParticipants = useAppSelector(selectCombinedUserAndParticipants);
  const isAutomodActive = useAppSelector(selectAutomodActiveState);
  const runningParticipantIds = useAppSelector(selectAutomoderationParticipantIds);
  const participantsWithoutUser = configurationParticipants.slice(1);
  const [includeTalkingStickCreator, setIncludeTalkingStickCreator] = useState<boolean>(true);

  const userInitiatingTalkingStick = configurationParticipants[0];

  const activeParticipants = useMemo(() => {
    const map = new Map();
    for (const participant of configurationParticipants) {
      map.set(participant.id, participant);
    }
    return runningParticipantIds.map((id) => map.get(id)).filter(Boolean);
  }, [configurationParticipants, runningParticipantIds]);

  const [selectedSortType, setSelectedSortType] = useState<SortOption>(SortOption.NameASC);

  const sortParticipants = useCallback(sortParticipantsWithConfig({ language: i18n.language }), [i18n.language]);

  const sortedParticipants = useMemo(() => {
    return sortParticipants(participantsWithoutUser, selectedSortType);
  }, [participantsWithoutUser, sortParticipants, selectedSortType]);

  const handleStart = useCallback(() => {
    const participantIdList = sortedParticipants.map((participant) => participant.id);
    const sortedPlaylist = includeTalkingStickCreator
      ? [userInitiatingTalkingStick.id, ...participantIdList]
      : [...participantIdList];
    dispatch(
      talkingStickStart.action({
        playlist: sortedPlaylist,
      })
    );
  }, [sortedParticipants, includeTalkingStickCreator]);

  const handleStop = () => {
    dispatch(talkingStickStop.action());
  };

  const handleSkipSpeaker = () => {
    dispatch(selectNext.action());
  };

  return (
    <Stack
      spacing={2}
      sx={{
        flex: 1,
        overflow: 'hidden',
      }}
    >
      {!isAutomodActive && (
        <Stack spacing={2}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography>{t('sort-label')}</Typography>
            {/* Component auto closes when selected sort type changes. */}
            <TalkingStickSortButton
              key={selectedSortType}
              selectedSortType={selectedSortType}
              onChange={setSelectedSortType}
            />
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography
              id={INCLUDE_MODERATOR_ID}
              component="label"
              htmlFor="include-moderator-switch"
              fontWeight="normal"
              mr={1}
            >
              {t('talking-stick-include-moderator-switch')}
            </Typography>
            <CommonSwitch
              id="include-moderator-switch"
              onChange={() => setIncludeTalkingStickCreator(!includeTalkingStickCreator)}
              value={includeTalkingStickCreator}
              checked={includeTalkingStickCreator}
              color="primary"
              aria-labelledby={INCLUDE_MODERATOR_ID}
            />
          </Box>
        </Stack>
      )}
      <Stack
        sx={{
          overflow: 'hidden',
          flex: 1,
        }}
      >
        <TalkingStickParticipantList participants={isAutomodActive ? activeParticipants : sortedParticipants} />
      </Stack>
      <Stack>
        {!isAutomodActive ? (
          <Button type="button" onClick={handleStart} color="secondary">
            {t('global-start-now')}
          </Button>
        ) : (
          <Stack
            spacing={1}
            sx={{
              flexDirection: 'column',
            }}
          >
            <Button type="button" onClick={handleSkipSpeaker} color="secondary">
              {t('talking-stick-skip-speaker')}
            </Button>
            <Button type="button" onClick={handleStop}>
              {t('global-stop')}
            </Button>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

export default memo(TalkingStickTabPanel);
