// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Box,
  Grid,
  ListItem,
  ListItemAvatar as MuiListItemAvatar,
  ListItemText as MuiListItemText,
  Typography,
  styled,
} from '@mui/material';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { MicOffIcon, MicOnIcon as MicOnDefaultIcon } from '../../../../assets/icons';
import { ParticipantAvatar } from '../../../../commonComponents';
import { useDateFormat } from '../../../../hooks';
import { ListableParticipant } from '../../types/participant';

const StyledListItem = styled(ListItem, {
  shouldForwardProp: (prop) => !(['isActiveSpeaker', 'isCurrentUser'] as Array<PropertyKey>).includes(prop),
})<{ isActiveSpeaker?: boolean; isCurrentUser?: boolean }>(({ theme, isActiveSpeaker, isCurrentUser }) => {
  const styles = {
    padding: theme.spacing(0, 1.5),
    minHeight: theme.typography.pxToRem(56),
    border: '1px solid',
    borderRadius: theme.spacing(1),
    backgroundColor: isActiveSpeaker ? '#1A2D33' : 'unset',
    borderColor: 'transparent',
  };

  if (isCurrentUser) {
    styles.borderColor = '#949493';
  }

  if (isActiveSpeaker) {
    styles.borderColor = theme.palette.secondary.main;
  }

  return styles;
});

const Avatar = styled(ParticipantAvatar)({
  width: '2.25rem',
  height: '2.25rem',
  fontSize: '0.75rem',
});

const ListItemAvatar = styled(MuiListItemAvatar)({
  minWidth: 'initial',
});

const ListItemText = styled(MuiListItemText)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(0, 1.5),
  '& p': {
    fontWeight: 400,
    lineHeight: 1.25,
  },
}));

const IconsContainer = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  '& svg': {
    width: theme.typography.pxToRem(18),
    height: theme.typography.pxToRem(18),
  },
}));

const MicOnIcon = styled(MicOnDefaultIcon)(({ theme }) => ({
  color: theme.palette.secondary.main,
}));

interface ParticipantListItem extends ListableParticipant {
  isActiveSpeaker?: boolean;
  isCurrentUser?: boolean;
}

const ParticipantListItem = ({
  avatarUrl,
  displayName,
  joinedAt,
  isActiveSpeaker,
  isCurrentUser,
}: ParticipantListItem) => {
  const { t } = useTranslation();
  const joinedTimestamp = new Date(joinedAt ?? new Date());
  const formattedJoinedTime = useDateFormat(joinedTimestamp, 'time');

  return (
    <StyledListItem isActiveSpeaker={isActiveSpeaker} isCurrentUser={isCurrentUser}>
      <Grid
        container
        direction="row"
        wrap="nowrap"
        sx={{
          alignItems: 'center',
          flexGrow: 1,
        }}
      >
        <Grid>
          <ListItemAvatar>
            <Avatar src={avatarUrl}>{displayName}</Avatar>
          </ListItemAvatar>
        </Grid>
        <Grid size="grow">
          <ListItemText
            primary={
              <Typography variant="body1" noWrap sx={{ mb: 0.25 }}>
                {displayName}
              </Typography>
            }
            secondary={
              <Typography variant="caption">
                {t('participant-joined-text', {
                  joinedTime: formattedJoinedTime,
                })}
              </Typography>
            }
          />
        </Grid>
        <IconsContainer>
          {isActiveSpeaker ? (
            <MicOnIcon
              type="functional"
              title={t('active-speaker-icon-title')}
              titleId="active-speaker-icon-title-id"
            />
          ) : (
            <MicOffIcon type="decorative" />
          )}
        </IconsContainer>
      </Grid>
    </StyledListItem>
  );
};

export default memo(ParticipantListItem);
