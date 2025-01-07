// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { List } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useState, useEffect } from 'react';

import { useAppSelector } from '../../../hooks';
import { selectAllGlobalChatMessages } from '../../../store/slices/chatSlice';
import { selectOurUuid } from '../../../store/slices/userSlice';
import { ChatMessage } from '../../../types';
import ChatAnnouncement from './ChatAnnouncement';

// This component is responsible for announcing new chat messages to screen reader users.
// It keeps a list of new messages and announces them one by one.
// To prevent cluttering of the DOM, only the current message is rendered.
// After it has been announced, it is removed from the list and next message will be rendered into the list.
const ChatLiveRegion = () => {
  const [messagesToAnnounce, setMessagesToAnnounce] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<ChatMessage | null>(null);

  const globalMessages = useAppSelector(selectAllGlobalChatMessages);
  const ourId = useAppSelector(selectOurUuid);

  // First time this timepoint will be set, when user opens the global chat (first render).
  // After that, it will be updated based on the latest received message timestamp.
  // We need to keep track of that, as we remove messages from the announcement list after they have been announced.
  // So we don't add already announced messages to the list again.
  const [considerationTimestamp, setConsiderationTimestamp] = useState<Date>(new Date());
  const calculateConsiderationTimestamp = (messages: ChatMessage[]) => {
    if (messages.length > 0) {
      const latestTimestamp = Math.max(...messages.map((message) => new Date(message.timestamp).getTime()));
      return new Date(latestTimestamp);
    } else {
      return considerationTimestamp;
    }
  };

  useEffect(() => {
    const messagesFromOthers = globalMessages.filter((message) => message.source !== ourId);
    const newMessagesFromOthers = messagesFromOthers.filter(
      (message) => new Date(message.timestamp) > considerationTimestamp
    );
    setMessagesToAnnounce((prevMessages) => [...prevMessages, ...newMessagesFromOthers]);

    const newConsiderationTimestamp = calculateConsiderationTimestamp(messagesFromOthers);
    setConsiderationTimestamp(newConsiderationTimestamp);
  }, [globalMessages, ourId]);

  useEffect(() => {
    if (messagesToAnnounce.length > 0) {
      if (currentMessage?.id !== messagesToAnnounce[0].id) {
        setCurrentMessage(messagesToAnnounce[0]);
      }
    } else {
      setCurrentMessage(null);
    }
  }, [messagesToAnnounce]);

  // After current message has been announced, we remove it from the list.
  // Current message is always the first element of the list.
  const handleAnnouncementEnd = () => {
    setMessagesToAnnounce((prevMessages) => [...prevMessages.slice(1)]);
  };

  return (
    <List sx={visuallyHidden} role="log">
      {currentMessage && (
        <ChatAnnouncement key={currentMessage.id} message={currentMessage} onAnnouncementEnd={handleAnnouncementEnd} />
      )}
    </List>
  );
};

export default ChatLiveRegion;
