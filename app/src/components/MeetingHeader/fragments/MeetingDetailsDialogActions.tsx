// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, DialogActions, Button, Typography } from '@mui/material';
import { CallIn, StreamingLink } from '@opentalk/rest-api-rtk-query';
import { MeetingDetails } from '@opentalk/rest-api-rtk-query/src/types/event';
import { useTranslation } from 'react-i18next';

import { notifications } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { selectUserAsParticipant } from '../../../store/selectors';
import { selectIsFeatureEnabled } from '../../../store/slices/configSlice';

const DialogActionsTitle = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(14),
  fontWeight: 'bold',
  padding: theme.spacing(0, 3),
  marginBottom: theme.spacing(2),
}));

const DialogActionsLeftAligned = styled(DialogActions)({ justifyContent: 'start' });

export interface MeetingDetailsDialogActionsProps {
  title: string;
  roomPassword: string;
  meetingDetails?: MeetingDetails;
  inviteUrl?: URL | null;
}

const MeetingDetailsDialogActions = ({
  title,
  roomPassword,
  meetingDetails,
  inviteUrl,
}: MeetingDetailsDialogActionsProps) => {
  const { t } = useTranslation();

  const currentUser = useAppSelector(selectUserAsParticipant);
  const isGuestsAllowedFeatureEnabled = useAppSelector(selectIsFeatureEnabled('guests_allowed'));

  const handleClipboardClick = () => {
    navigator.clipboard.writeText(createClipboardString()).then(() => {
      notifications.success(t('meeting-details-dialog-copy-success'));
    });
  };

  const handleMailToClick = () => window.open(createMailToLinkString());

  const createMailToLinkString = () => {
    const subject = `subject=OpenTalk Meeting Invitation - ${title}`;
    const body = `body=${createClipboardString()}`;
    return encodeURI(`mailto:?${subject}&${body}`);
  };

  const createClipboardString = () => {
    return `${t('meeting-details-dialog-invite-line', { name: currentUser?.displayName })}.

${t('global-title')}: ${title}

${createJoinMeetingString()}

`;
  };

  const createStreamingLinkString = (streamingLinks: StreamingLink[]) =>
    streamingLinks.map((streamingLink) => `${streamingLink.name}: ${streamingLink.url}`).join('\n');

  const createCallInString = (callIn: CallIn) => `${t('global-call-in')}
${t('global-call-in-number')}: ${callIn.tel}
${t('global-call-in-id')}: ${callIn.id}
${t('global-call-in-pin')}: ${callIn.password}
  `;

  const createJoinMeetingString = () => {
    const isGuestParticipationAvailable = isGuestsAllowedFeatureEnabled && inviteUrl;
    const isCallInAvailable = meetingDetails?.callIn !== undefined;
    const isAnyStreamingLinkAvailable = meetingDetails !== undefined && meetingDetails.streamingLinks.length > 0;
    const isAnyParticipationMeanAvailable =
      isGuestParticipationAvailable || isAnyStreamingLinkAvailable || isCallInAvailable;
    if (!isAnyParticipationMeanAvailable) {
      return t('meeting-details-dialog-join-prohibited-line');
    }

    let joinString = `${t('meeting-details-dialog-join-line\n')}`;
    if (isGuestParticipationAvailable) {
      joinString += `${t('global-meeting-link')}: ${inviteUrl}\n`;
      if (roomPassword) {
        joinString += `${t('global-password')}: ${roomPassword}\n`;
      }
    }

    if (meetingDetails?.callIn) {
      joinString += `\n`;
      joinString += createCallInString(meetingDetails.callIn);
    }

    if (isAnyStreamingLinkAvailable) {
      joinString += `\n`;
      joinString += `${t('global-streaming-link', { count: meetingDetails.streamingLinks.length })}\n`;
      joinString += createStreamingLinkString(meetingDetails.streamingLinks);
    }

    return joinString;
  };

  return (
    <>
      <DialogActionsTitle>{t('meeting-details-dialog-button-header')}</DialogActionsTitle>
      <DialogActionsLeftAligned>
        {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
        <Button type="submit" variant="contained" color="secondary" onClick={handleClipboardClick} autoFocus>
          {t('meeting-details-dialog-copy-button')}
        </Button>
        <Button type="submit" variant="contained" color="secondary" onClick={handleMailToClick}>
          {t('meeting-details-dialog-mail-button')}
        </Button>
      </DialogActionsLeftAligned>
    </>
  );
};

export default MeetingDetailsDialogActions;
