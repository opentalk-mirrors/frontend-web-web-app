// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Typography } from '@mui/material';
import { truncate } from 'lodash';
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
  const displayName = truncate(author, { length: 30 });
  const announcement = t('chat-live-message-announcemenet', { name: displayName ?? t('global-participant') });

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
