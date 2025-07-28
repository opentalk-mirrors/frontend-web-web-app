// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, Stack, Typography, styled, useTheme } from '@mui/material';
import { EventId, InviteStatus, isRecurringEvent } from '@opentalk/rest-api-rtk-query';
import { skipToken } from '@reduxjs/toolkit/query';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import {
  useAcceptEventInviteMutation,
  useDeclineEventInviteMutation,
  useGetEventQuery,
  useGetMeQuery,
  useGetRoomTariffQuery,
} from '../../../api/rest';
import { notifications } from '../../../commonComponents';
import SuspenseLoading from '../../../commonComponents/SuspenseLoading/SuspenseLoading';
import EventTimePreview from '../../../components/EventTimePreview';
import InviteToMeeting from '../../../components/InviteToMeeting';
import InvitedParticipants from '../../../components/InvitedParticipants';
import { useUpdateDocumentTitle } from '../../../hooks/useUpdateDocumentTitle';
import { RecurrenceInstance } from '../../../utils/eventUtils';
import ButtonBack from './fragments/ButtonBack';
import RoomAssetTable from './fragments/RoomAssetTable';

const ButtonContainer = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(3),
  flexDirection: 'row',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1, 1, 0),
}));

const ParticipantLimitTypography = styled(Typography)(({ theme }) => ({
  paddingTop: theme.spacing(3),
}));

const ContainerStack = styled(Stack)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

const EventDetailsPage = () => {
  const [acceptEventInvitation] = useAcceptEventInviteMutation();
  const [declineEventInvitation] = useDeclineEventInviteMutation();
  const { t } = useTranslation();
  const { eventId } = useParams<'eventId'>() as { eventId: EventId };
  const { data: event, isLoading, isError, isFetching } = useGetEventQuery({ eventId, inviteesMax: 20 });
  const { data: me } = useGetMeQuery();

  const [searchParams] = useSearchParams();
  const eventInstanceStart = searchParams.get('start');
  const eventInstanceEnd = searchParams.get('end');
  const recurrenceInstance: RecurrenceInstance | undefined =
    eventInstanceStart && eventInstanceEnd && event && isRecurringEvent(event)
      ? {
          start: eventInstanceStart,
          end: eventInstanceEnd,
          originalStart: event.startsAt.datetime,
          recurrencePattern: event.recurrencePattern[0],
        }
      : undefined;

  const isMeetingCreator = me?.id === event?.createdBy.id;
  const { data: tariff } = useGetRoomTariffQuery(event?.room.id ?? skipToken);
  const roomParticipantLimit = tariff?.quotas.roomParticipantLimit;
  const theme = useTheme();
  const navigate = useNavigate();
  const pageHeading = event?.title || t('fallback-room-title') || '';
  useUpdateDocumentTitle(pageHeading);

  if (isLoading || isFetching) {
    return <SuspenseLoading />;
  }

  if (isError) {
    notifications.error(t('error-unauthorized'));
    navigate('/dashboard');
    return null;
  }

  if (!event) {
    return null;
  }

  const getTimeInformationString = () => {
    if (event.isTimeIndependent) {
      return t('dashboard-meeting-details-page-timeindependent');
    }
    if (event.isAllDay) {
      return t('dashboard-meeting-details-page-all-day');
    }

    const startDate = new Date(eventInstanceStart ?? event.startsAt.datetime);
    const endDate = new Date(eventInstanceEnd ?? event.endsAt.datetime);
    return <EventTimePreview startDate={startDate} endDate={endDate} />;
  };

  const acceptInvite = () => {
    return acceptEventInvitation({ eventId })
      .unwrap()
      .then(() =>
        notifications.success(
          t(`dashboard-event-accept-invitation-notification`, {
            meetingTitle: event.title,
          })
        )
      )
      .catch(() =>
        notifications.error(
          t(`error-general`, {
            meetingTitle: event.title,
          })
        )
      );
  };

  const declineInvite = () => {
    return declineEventInvitation({ eventId })
      .unwrap()
      .then(() =>
        notifications.success(
          t(`dashboard-event-decline-invitation-notification`, {
            meetingTitle: event.title,
          })
        )
      )
      .catch(() =>
        notifications.error(
          t(`error-general`, {
            meetingTitle: event.title,
          })
        )
      );
  };

  return (
    <ContainerStack
      style={{ paddingRight: theme.spacing(5), marginRight: theme.spacing(-5) }}
      sx={{
        justifyContent: 'space-between',
        height: '100%',
        overflow: 'auto',
      }}
    >
      <Stack>
        <Stack
          sx={{
            mb: 4,
          }}
        >
          <Typography variant="h1" fontWeight="bold">
            {pageHeading}
          </Typography>
          <Typography
            variant="body1"
            component="span"
            sx={{
              fontWeight: 400,
              mt: 1,
            }}
          >
            {getTimeInformationString()}
          </Typography>
        </Stack>

        {event.description && event.description !== '' && (
          <Stack
            sx={{
              mb: 4,
            }}
          >
            <Typography variant="h2">{t('dashboard-meeting-details-page-description-title')}</Typography>
            <Box
              sx={{
                maxHeight: 50,
                overflow: 'auto',
                mt: 1,
              }}
            >
              <Typography variant="body2">{event.description}</Typography>
            </Box>
          </Stack>
        )}

        <Stack
          sx={{
            mb: 2,
          }}
        >
          <InviteToMeeting existingEvent={event} showOnlyLinkFields isUpdatable={false} />
        </Stack>
        {roomParticipantLimit && (
          <ParticipantLimitTypography>
            {t('dashboard-meeting-details-page-participant-limit', { maxParticipants: roomParticipantLimit })}
          </ParticipantLimitTypography>
        )}

        {event.invitees && event.invitees.length > 0 && <InvitedParticipants eventId={event.id} isUpdatable={false} />}

        <RoomAssetTable
          roomId={event.room.id}
          isMeetingCreator={isMeetingCreator}
          recurrenceInstance={recurrenceInstance}
        />
      </Stack>
      <ButtonContainer>
        <ButtonBack />
        {!isMeetingCreator && (
          <>
            <Button color="secondary" onClick={declineInvite} disabled={event.inviteStatus === InviteStatus.Declined}>
              {t('global-decline')}
            </Button>
            <Button onClick={acceptInvite} disabled={event.inviteStatus === InviteStatus.Accepted}>
              {t('global-accept')}
            </Button>
          </>
        )}
      </ButtonContainer>
    </ContainerStack>
  );
};

export default EventDetailsPage;
