// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Stack, Typography, styled, useTheme } from '@mui/material';
import { format } from 'date-fns';
import Linkify from 'linkify-react';
import { uniqueId } from 'lodash';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Role } from '../../../api/types/incoming/control';
import { ModeratorIcon } from '../../../assets/icons';
import { ParticipantAvatar } from '../../../commonComponents';
import { useAppSelector, useDateFormat } from '../../../hooks';
import { RoomEvent } from '../../../store/slices/eventSlice';
import { selectParticipantById } from '../../../store/slices/participantsSlice';
import { selectAvatarUrl, selectDisplayName, selectOurUuid } from '../../../store/slices/userSlice';
import { ChatMessage as ChatMessageType } from '../../../types';
import { isEventMessage } from '../../../utils/typeGuardUtils';
import TextWithDivider from '../../TextWithDivider';

const EventTypography = styled(TextWithDivider)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(12),
}));

const EventNameTypography = styled(Typography)(({ theme }) => ({
  display: 'inline-block',
  color: theme.palette.common.white,
  marginRight: theme.typography.pxToRem(5),
}));

const EventMessageTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.placeholder,
  display: 'inline-block',
}));

const NameTypography = styled(Typography, {
  shouldForwardProp: (prop) => !['isModerator'].includes(prop as string),
})<{ isModerator?: boolean }>(({ theme, isModerator }) => ({
  color: isModerator ? theme.palette.primary.main : theme.palette.common.white,
  flex: 1,
}));

const TimeTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.placeholder,
  whiteSpace: 'nowrap',
}));

const ContentTypography = styled(Typography, { shouldForwardProp: (prop) => prop !== 'singleEmoji' })<{
  singleEmoji?: boolean;
}>(({ singleEmoji }) => ({
  whiteSpace: 'pre-line',
  wordBreak: 'break-word',
  fontSize: singleEmoji ? '2rem' : '',
}));
const Avatar = styled(ParticipantAvatar)({
  width: '2.25rem',
  height: '2.25rem',
  fontSize: '0.75rem',
});

const getSender = (message: ChatMessageType | RoomEvent) => {
  return isEventMessage(message) ? selectParticipantById(message?.target) : selectParticipantById(message?.source);
};

interface ChatMessageProps {
  message: ChatMessageType | RoomEvent;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const sender = useAppSelector(getSender(message));
  const ourUuid = useAppSelector(selectOurUuid);
  const ownDisplayName = useAppSelector(selectDisplayName);
  const ownAvatarUrl = useAppSelector(selectAvatarUrl);
  const theme = useTheme();
  const { t } = useTranslation();
  const date = new Date(message?.timestamp ?? Date.now());
  const formattedTime = useDateFormat(date, 'time');

  const isItSingleEmojiMessage = useCallback(() => {
    if (isEventMessage(message)) {
      return;
    }
    const trimedMessage = message.content.trim();
    const isSingleMessage = trimedMessage.split(' ').length === 1;
    if (!isSingleMessage) {
      return;
    }
    /*
    Single Emoji Regex
    1. (\ud83c[\udde6-\uddff]){2}
     {2} matches the previous token exactly 2 times
     \ud83c matches the character � with index D83C16 (5535610 or 1540748)
     [\udde6-\uddff] \udde6-\uddff matches a single character in the range between � (index 56806) and � (index 56831) (case sensitive)
    2. ([*0-9]\u20e3)
      * matches the character * with index 4210 (2A16 or 528) literally (case sensitive)
      0-9 matches a single character in the range between 0 (index 48) and 9 (index 57) (case sensitive)
      \u20e3 matches the character ⃣ with index 20E316 (841910 or 203438) literally (case sensitive)
    3. (\u00a9|\u00ae|[\u2000-\u3300]|[\ud83c-\ud83e][\ud000-\udfff])
      \u00a9 matches the character © with index A916 (16910 or 2518) literally (case sensitive)
      \u00ae matches the character ® with index AE16 (17410 or 2568) literally (case sensitive)
      [\u2000-\u3300]\u2000-\u3300 matches a single character in the range between (index 8192) and ㌀ (index 13056) (case sensitive)
      [\ud83c-\ud83e]\ud83c-\ud83e matches a single character in the range between � (index 55356) and � (index 55358) (case sensitive)
      [\ud000-\udfff]\ud000-\udfff matches a single character in the range between 퀀 (index 53248) and � (index 57343) (case sensitive)
    4. ((\ud83c[\udffb-\udfff])?(\ud83e[\uddb0-\uddb3])?(\ufe0f?\u200d([\u2000-\u3300]|[\ud83c-\ud83e][\ud000-\udfff])\ufe0f?)?)*
      * matches the previous token between zero and unlimited times, as many times as possible, giving back as needed (greedy)
      ? matches the previous token between zero and one times, as many times as possible, giving back as needed (greedy)
    5. \ud83c matches the character � with index D83C16 (5535610 or 1540748) literally (case sensitive)
      [\udffb-\udfff]\udffb-\udfff matches a single character in the range between � (index 57339) and � (index 57343) (case sensitive)
      [\uddb0-\uddb3]\uddb0-\uddb3 matches a single character in the range between � (index 56752) and � (index 56755) (case sensitive)
    6. \ufe0f matches the character ️ with index FE0F16 (6503910 or 1770178) literally (case sensitive)
    7. \u200d matches the character ‍ with index 200D16 (820510 or 200158) literally (case sensitive)
      [\ud83c-\ud83e]\ud83c-\ud83e matches a single character in the range between � (index 55356) and � (index 55358) (case sensitive)
      [\ud000-\udfff]\ud000-\udfff matches a single character in the range between 퀀 (index 53248) and � (index 57343) (case sensitive)
    8. \ufe0f matches the character ️ with index FE0F16 (6503910 or 1770178) literally (case sensitive)
      $ asserts position at the end of a line
  */
    const singleEmojiRegex =
      /^((\ud83c[\udde6-\uddff]){2}|([*0-9]\u20e3)|(\u00a9|\u00ae|[\u2000-\u3300]|[\ud83c-\ud83e][\ud000-\udfff])((\ud83c[\udffb-\udfff])?(\ud83e[\uddb0-\uddb3])?(\ufe0f?\u200d([\u2000-\u3300]|[\ud83c-\ud83e][\ud000-\udfff])\ufe0f?)?)*)$/g;

    return singleEmojiRegex.test(trimedMessage);
  }, [message]);

  const options = {
    target: '_blank',
    attributes: {
      style: {
        color: theme.palette.primary.main,
      },
    },
  };

  const getTimeStringFromTimestamp = (message: RoomEvent) => {
    const date = Date.parse(message.timestamp);
    return format(date, 'HH:mm');
  };

  if (isEventMessage(message)) {
    switch (message.event) {
      case 'chat_enabled':
      case 'chat_disabled':
        return (
          <EventTypography variant="body2">
            <EventMessageTypography variant="caption">
              {t(`chat-${message.event === 'chat_enabled' ? 'enabled' : 'disabled'}-message`)}
            </EventMessageTypography>
          </EventTypography>
        );
      case 'left':
        return (
          <EventTypography variant="body2" data-testid="user-event-message">
            <EventNameTypography variant="caption" translate="no">
              {sender?.displayName}
            </EventNameTypography>
            <EventMessageTypography variant="caption">
              {t(`participant-${message.reason === 'quit' ? message.event : 'removed'}-event`, {
                time: getTimeStringFromTimestamp(message),
              })}
            </EventMessageTypography>
          </EventTypography>
        );
      case 'joined':
        return (
          <EventTypography variant="body2" data-testid="user-event-message">
            <EventNameTypography variant="caption" translate="no">
              {sender?.displayName}
            </EventNameTypography>
            <EventMessageTypography variant="caption">
              {t(`participant-joined-event`, { time: getTimeStringFromTimestamp(message) })}
            </EventMessageTypography>
          </EventTypography>
        );
    }
  }

  const ownMessage = message?.source === ourUuid;
  const displayName = ownMessage ? ownDisplayName : sender?.displayName;
  const isModerator = sender?.role === Role.Moderator;
  const renderNameAndTime = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: ownMessage ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <NameTypography
        noWrap
        isModerator={isModerator}
        title={displayName}
        textAlign={ownMessage ? 'right' : 'left'}
        translate="no"
      >
        {displayName}
      </NameTypography>
      {isModerator && (
        <ModeratorIcon
          color="primary"
          type="functional"
          title={t('moderator-icon-title')}
          titleId={uniqueId('moderator-icon-title-')}
        />
      )}
      <TimeTypography variant="caption">{formattedTime}</TimeTypography>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: ownMessage ? 'row-reverse' : 'row',
        flex: 1,
        gap: 1,
        width: '100%',
      }}
    >
      <Avatar src={ownMessage ? ownAvatarUrl : sender?.avatarUrl}>{displayName}</Avatar>
      <Stack
        sx={{
          gap: 1,
          py: 1,
          width: '85%',
        }}
      >
        {renderNameAndTime()}
        <ContentTypography singleEmoji={isItSingleEmojiMessage()} variant="body2" align={ownMessage ? 'right' : 'left'}>
          <Linkify options={options}>{message.content}</Linkify>
        </ContentTypography>
      </Stack>
    </Box>
  );
};

export default ChatMessage;
