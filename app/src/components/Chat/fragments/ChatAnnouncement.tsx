// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../../../hooks';
import { selectParticipantName } from '../../../store/slices/participantsSlice';
import { ChatMessage } from '../../../types';
import { ANNOUNCEMENT_TIMEOUT } from './constants';

interface ChatAnnouncementProps {
  message: ChatMessage;
  onAnnouncementEnd: () => void;
}

const ChatAnnouncement = (props: ChatAnnouncementProps) => {
  const { message, onAnnouncementEnd } = props;
  const { t } = useTranslation();

  const author = useAppSelector((state) => selectParticipantName(state, message.source));
  const announcement = t('chat-live-message-announcemenet', { name: author ?? t('global-participant') });

  useEffect(() => {
    const timer = setTimeout(() => {
      onAnnouncementEnd();
    }, ANNOUNCEMENT_TIMEOUT);
    return () => {
      clearTimeout(timer);
    };
  }, [onAnnouncementEnd]);

  return <Typography>{announcement}</Typography>;
};

export default ChatAnnouncement;
