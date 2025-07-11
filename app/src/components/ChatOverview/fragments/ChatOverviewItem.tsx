// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Grid,
  ListItemButton,
  ListItemText,
  ListItemAvatar as MuiListItemAvatar,
  Typography,
  styled,
} from '@mui/material';
import { isEmpty } from 'lodash';

import { ParticipantAvatar } from '../../../commonComponents';
import { useAppSelector, useDateFormat } from '../../../hooks';
import { ChatProps, selectUnreadPersonalMessageCountByTarget } from '../../../store/slices/chatSlice';
import { selectParticipantByParticipantId } from '../../../store/slices/participantsSlice';
import { ChatScope } from '../../../types';
import type { ParticipantId } from '../../../types';

const CustomListItemButton = styled(ListItemButton)(({ theme }) => ({
  '&:hover': {
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
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
  const participant = useAppSelector(selectParticipantByParticipantId(chat.id as ParticipantId));
  const lastMessageTimestamp = chat.lastMessage?.timestamp ?? chat.messages.at(-1)?.timestamp;
  const date = lastMessageTimestamp ? new Date(lastMessageTimestamp) : new Date(0);
  const formattedTime = useDateFormat(date, 'time');
  const getDisplayName = () => (isEmpty(participant) ? chat.id : participant?.displayName);
  const lastSeenTimestampCount = useAppSelector((state) => selectUnreadPersonalMessageCountByTarget(state, chat.id));
  const hasUnreadMessage =
    (chat.scope === ChatScope.Private || chat.scope === ChatScope.Group) && lastSeenTimestampCount > 0;
  const fontWeight = hasUnreadMessage ? 'bold' : 'normal';

  const renderPrimaryText = () => (
    <Grid container direction="row" spacing={1}>
      <Grid size="grow">
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
      <Grid>
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
