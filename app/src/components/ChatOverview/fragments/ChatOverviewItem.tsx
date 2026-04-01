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
import { PrivateChatProps, selectUnreadPersonalMessageCountByTarget } from '../../../store/slices/chatSlice';
import { selectParticipantById } from '../../../store/slices/participantsSlice';
import { ChatScope } from '../../../types';

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

export interface ChatOverviewItemProps {
  chat: PrivateChatProps;
  onClick: (arg: string) => void;
}

const ChatOverviewItem = ({ chat, onClick }: ChatOverviewItemProps) => {
  const { scope, target } = chat.chatIdentifier;
  const participant = useAppSelector(selectParticipantById(target));
  const lastMessageTimestamp = chat.lastMessage?.timestamp ?? chat.messages.at(-1)?.timestamp;
  const date = lastMessageTimestamp ? new Date(lastMessageTimestamp) : new Date(0);
  const formattedTime = useDateFormat(date, 'time');
  const getDisplayName = () => (isEmpty(participant) ? target : participant?.displayName);
  const lastSeenTimestampCount = useAppSelector((state) => selectUnreadPersonalMessageCountByTarget(state, target));
  const hasUnreadMessage = scope === ChatScope.Private && lastSeenTimestampCount > 0;
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
    <CustomListItemButton onClick={() => onClick(String(target))}>
      <ListItemAvatar>
        <ParticipantAvatar src={participant?.avatarUrl}>{getDisplayName()}</ParticipantAvatar>
      </ListItemAvatar>
      <ListItemText primary={renderPrimaryText()} secondary={renderSecondaryText()} />
    </CustomListItemButton>
  );
};

export default ChatOverviewItem;
