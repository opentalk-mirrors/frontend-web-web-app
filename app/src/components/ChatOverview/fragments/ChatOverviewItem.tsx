// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  ListItemButton,
  ListItemAvatar as MuiListItemAvatar,
  ListItemText,
  Typography,
  Grid,
  styled,
} from '@mui/material';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';

import { ParticipantAvatar } from '../../../commonComponents';
import { useAppSelector, useDateFormat } from '../../../hooks';
import type { RootState } from '../../../store';
import { ChatProps, selectUnreadPersonalMessageCountByTarget } from '../../../store/slices/chatSlice';
import { selectParticipantById } from '../../../store/slices/participantsSlice';
import { ChatScope } from '../../../types';
import type { ParticipantId } from '../../../types';

const CustomListItemButton = styled(ListItemButton)(({ theme }) => ({
  '&:hover': {
    background: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
}));

const ListItemAvatar = styled(MuiListItemAvatar)(({ theme }) => ({
  minWidth: 'initial',
  marginRight: theme.spacing(1),
}));

const TimeTypography = styled(Typography)({
  opacity: 0.7,
});

interface IScopedChatItemProps {
  chat: ChatProps;
  onClick: (arg: string) => void;
}

const ChatOverviewItem = ({ chat, onClick }: IScopedChatItemProps) => {
  const participant = useAppSelector(selectParticipantById(chat.id as ParticipantId));
  const date = new Date(chat.lastMessage?.timestamp) ?? Date.now;
  const formattedTime = useDateFormat(date, 'time');
  const getDisplayName = () => (isEmpty(participant) ? chat.id : participant?.displayName);
  const lastSeenTimestampCount = useAppSelector((state: RootState) =>
    selectUnreadPersonalMessageCountByTarget(state, chat.id)
  );
  const [fontWeight, setFontWeigth] = useState('normal');

  useEffect(() => {
    if (chat.scope === ChatScope.Private || chat.scope === ChatScope.Group) {
      if (lastSeenTimestampCount > 0) {
        setFontWeigth('bold');
      } else {
        setFontWeigth('normal');
      }
    }
  }, [chat, lastSeenTimestampCount]);

  const renderPrimaryText = () => (
    <Grid container direction="row" spacing={1}>
      <Grid item zeroMinWidth xs>
        <Typography
          variant="body1"
          noWrap
          translate="no"
          sx={{
            fontWeight: fontWeight,
          }}
        >
          {getDisplayName()}
        </Typography>
      </Grid>
      <Grid item>
        <TimeTypography variant="caption" fontWeight={fontWeight}>
          {formattedTime}
        </TimeTypography>
      </Grid>
    </Grid>
  );

  const renderSecondaryText = () => (
    <Typography
      variant="body1"
      noWrap
      sx={{
        fontWeight: fontWeight,
      }}
    >
      {chat.lastMessage?.content || ''}
    </Typography>
  );

  return (
    <CustomListItemButton onClick={() => onClick(chat.id)}>
      <ListItemAvatar>
        <ParticipantAvatar src={participant?.avatarUrl}>{getDisplayName()}</ParticipantAvatar>
      </ListItemAvatar>
      <ListItemText primary={renderPrimaryText()} secondary={renderSecondaryText()} />
    </CustomListItemButton>
  );
};

export default ChatOverviewItem;
