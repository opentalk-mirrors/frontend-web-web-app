// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Skeleton, Stack, Typography, styled } from '@mui/material';
import { CoreFeatures, GuestAccess } from '@opentalk/rest-api-rtk-query';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useCreateEventMutation, useGetMeTariffQuery, useLazyGetEventQuery } from '../../../api/rest';
import { notifications } from '../../../commonComponents';
import InviteToMeeting from '../../../components/InviteToMeeting';
import { useUpdateDocumentTitle } from '../../../hooks/useUpdateDocumentTitle';
import { isFeatureEnabledPredicate } from '../../../utils/moduleUtils';

const Container = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gridTemplateRows: 'auto 1fr',
  height: '100%',
  overflow: 'auto',
  gap: theme.spacing(2),
  color: theme.palette.text.primary,
}));

const AttentionMessageTypography = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(14),
  padding: theme.spacing(2, 0),
}));

const CreateDirectMeeting = () => {
  const [createEvent, { data: event, isLoading: createEventIsLoading, error }] = useCreateEventMutation();
  const { t } = useTranslation();
  const [getEvent, { data: updatedEvent, isLoading: getEventLoading, error: getEventError }] = useLazyGetEventQuery();
  const { data: tariff, isSuccess: tariffLoaded, isError: tariffError } = useGetMeTariffQuery();
  const pageHeading = t('dashboard-direct-meeting-title');
  const hasCreatedRoom = useRef(false);

  useUpdateDocumentTitle(pageHeading);

  useEffect(() => {
    // Wait for the tariff to settle so the meeting is created once with the correct guest access.
    if (hasCreatedRoom.current || (!tariffLoaded && !tariffError)) {
      return;
    }
    hasCreatedRoom.current = true;

    const creationDate = new Date();
    const creationHours = creationDate.getHours().toString().padStart(2, '0');
    const creationMinutes = creationDate.getMinutes().toString().padStart(2, '0');

    const isGuestAccessAllowedByTariff = Boolean(
      tariff && isFeatureEnabledPredicate(CoreFeatures.GuestsAllowed, tariff.modules)
    );

    createEvent({
      title: t('dashboard-direct-meeting-generated-title', { creationHours, creationMinutes }),
      description: '',
      isTimeIndependent: true,
      waitingRoom: false,
      isAdhoc: true,
      e2eEncryption: false,
      password: null,
      guestAccess: isGuestAccessAllowedByTariff ? GuestAccess.DirectAccess : GuestAccess.Disabled,
    })
      .unwrap()
      .catch(() => notifications.error(t('dashboard-meeting-notification-error')));
  }, [createEvent, t, tariff, tariffLoaded, tariffError]);

  useEffect(() => {
    if (!getEventLoading && getEventError) {
      notifications.error(t('dashboard-meeting-notification-error'));
    }
  }, [getEventLoading, getEventError, t]);

  const renderLoading = () => (
    <Stack spacing={2}>
      <Skeleton height={40} />
      <Skeleton height={80} />
      <Skeleton height={40} />
      <Skeleton height={80} />
    </Stack>
  );

  if (!event || createEventIsLoading || error) {
    return renderLoading();
  }

  return (
    <Container>
      <Stack>
        <Typography variant="h1" fontWeight="bold">
          {pageHeading}
        </Typography>
        <AttentionMessageTypography>{t('dashboard-direct-meeting-attention')}</AttentionMessageTypography>
      </Stack>
      <InviteToMeeting
        isUpdatable={true}
        existingEvent={updatedEvent ?? event}
        adhocMeeting
        invitationsSent={() => getEvent({ eventId: event.id, inviteesMax: 10 })}
      />
    </Container>
  );
};

export default CreateDirectMeeting;
