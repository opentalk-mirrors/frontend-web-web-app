// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useState } from 'react';

import { useAppSelector } from '../../../hooks';
import { selectNotOwnGlobalChatMessages } from '../../../store/slices/chatSlice';
import { ChatMessage } from '../../../types';
import ChatAnnouncement from './ChatAnnouncement';

function filterAnnouncedMessages(messages: ChatMessage[], timestamp: string) {
  return messages.filter((message) => new Date(message.timestamp) > new Date(timestamp));
}

// This component is responsible for announcing new chat messages to screen reader users.
// It keeps a list of new messages and announces them one by one.
// To prevent cluttering of the DOM, only the current message is rendered.
// After it has been announced, it is removed from the list and next message will be rendered into the list.
const ChatLiveRegion = () => {
  // Messages are expected to be sorted from the latest to the oldest, meaning that at index 0 we get the latest one.
  const messages = useAppSelector(selectNotOwnGlobalChatMessages);

  // First time this timepoint will be set, when user opens the global chat (first render).
  // After that, it will be updated based on the latest received message timestamp.
  // We need to keep track of that, as we remove messages from the announcement list after they have been announced.
  // So we don't add already announced messages to the list again.
  const [lastAnnouncedTimestamp, setLastAnnouncedTimestamp] = useState<string>(new Date().toISOString());

  const messagesToAnnounce = filterAnnouncedMessages(messages, lastAnnouncedTimestamp);

  // After current message has been announced, we remove it from the list.
  // Current message is always the first element of the list.
  const handleAnnouncementEnd = () => {
    if (messagesToAnnounce[0]) {
      setLastAnnouncedTimestamp(messagesToAnnounce[0].timestamp);
    }
  };

  return (
    <Box sx={visuallyHidden} role="log">
      {messagesToAnnounce.length > 0 && (
        <ChatAnnouncement
          key={messagesToAnnounce[0].id}
          message={messagesToAnnounce[0]}
          onAnnouncementEnd={handleAnnouncementEnd}
        />
      )}
    </Box>
  );
};

export default ChatLiveRegion;
