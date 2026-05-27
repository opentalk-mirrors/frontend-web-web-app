// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { List as MuiList, ListItem, ListItemAvatar, ListItemText, Stack, Typography, styled } from '@mui/material';
import { truncate, uniqueId } from 'lodash';
import { useTranslation } from 'react-i18next';

import { CloseIcon, DoneIcon } from '../../../assets/icons';
import { ParticipantAvatar } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { selectParticipantsReadyList } from '../../../store/selectors';
import { selectReadyCheckEnabled } from '../../../store/slices/timerSlice';

const List = styled(MuiList)({
  overflow: 'auto',
});

const UserList = () => {
  const participants = useAppSelector(selectParticipantsReadyList);
  const isReadyCheckEnabled = useAppSelector(selectReadyCheckEnabled);
  const { t } = useTranslation();

  const renderReadyStatus = (isReady: boolean) =>
    isReady ? (
      <DoneIcon
        fontSize="small"
        color="primary"
        type="functional"
        title={t('timer-done-icon-title')}
        titleId={uniqueId('timer-done-icon-title-')}
      />
    ) : (
      <CloseIcon
        fontSize="small"
        color="warning"
        type="functional"
        title={t('timer-not-done-icon-title')}
        titleId={uniqueId('timer-not-done-icon-title-')}
      />
    );

  const renderUsers = () => {
    return participants.map((participant) => {
      if (participant.leftAt === null) {
        return (
          <ListItem key={participant.id} sx={{ px: 0 }}>
            <ListItemAvatar>
              <ParticipantAvatar src={participant.avatarUrl}>{participant.displayName}</ParticipantAvatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography noWrap translate="no">
                  {truncate(participant.displayName, { length: 100 })}
                </Typography>
              }
            />
            {isReadyCheckEnabled && renderReadyStatus(participant.isReady)}
          </ListItem>
        );
      }
      return null;
    });
  };

  if (participants.length <= 0) {
    return null;
  }

  return (
    <Stack
      spacing={1}
      sx={{
        overflow: 'hidden',
      }}
    >
      <Typography variant="h2">{t('global-participants')}</Typography>
      <List>{renderUsers()}</List>
    </Stack>
  );
};

export default UserList;
