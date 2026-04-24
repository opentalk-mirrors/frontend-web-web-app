// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';
import { EventId, RecordingStatus, StreamStatus } from '@opentalk/rest-api-rtk-query';
import { Trans } from 'react-i18next';

import { useInviteCode } from '../../hooks/useInviteCode';

const Link = styled('a')(({ theme }) => ({
  color: theme.palette.common.white,
}));

export interface NotificationProps {
  status: StreamStatus;
  publicUrl?: string;
}

export const StreamUpdatedNotification = ({ status, publicUrl }: NotificationProps) => {
  const i18nKey = `livestream-${status}-message`;

  //For livestream start we show a link to the public url of the stream
  if (status === StreamStatus.Active) {
    return (
      <Trans
        i18nKey={i18nKey}
        values={{ publicUrl }}
        components={{ publicUrl: <Link target="_blank" href={publicUrl} />, messageContent: <div /> }}
      />
    );
  }

  return <Trans i18nKey={i18nKey} />;
};

export interface RecordingNotificationProps {
  status: RecordingStatus;
  eventId?: EventId;
}

export const RecordingUpdatedNotification = ({ status, eventId }: RecordingNotificationProps) => {
  const i18nKey = `recording-${status}-message`;
  const inviteCode = useInviteCode();
  const isGuest = inviteCode !== undefined;

  // For non-guests when a recording stops, show a link to the meeting details
  if (status === RecordingStatus.Inactive && !isGuest && eventId) {
    const messageLink = `/dashboard/meetings/${eventId}`;
    return (
      <Trans
        i18nKey={`${i18nKey}-with-link`}
        values={{ messageLink }}
        components={{
          messageContent: <div />,
          messageLink: <Link target="_blank" href={messageLink} />,
        }}
      />
    );
  }

  return <Trans i18nKey={i18nKey} />;
};
