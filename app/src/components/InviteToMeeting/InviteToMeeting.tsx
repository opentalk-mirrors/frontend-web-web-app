// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Grid, styled } from '@mui/material';
import { Event, EventInvite, isEvent, UserRole } from '@opentalk/rest-api-rtk-query';
import { merge } from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { useCreateEventInviteMutation, useDeleteEventMutation, useGetMeTariffQuery } from '../../api/rest';
import { BackIcon } from '../../assets/icons';
import { notifications } from '../../commonComponents';
import SelectParticipants from '../../components/SelectParticipants';
import { useAppSelector } from '../../hooks';
import { selectFeatures } from '../../store/slices/configSlice';
import InvitedParticipants from '../InvitedParticipants';
import { ParticipantOption } from '../SelectParticipants';
import MeetingLinksAndPasswords from './fragments/MeetingLinksAndPasswords';

interface InviteToMeetingProps {
  isUpdatable: boolean;
  existingEvent: Event;
  adhocMeeting?: boolean;
  invitationsSent?: () => void;
  onBackButtonClick?: () => void;
  showOnlyLinkFields?: boolean;
}

const StepButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(0.5),
}));

const InviteToMeeting = ({
  isUpdatable,
  existingEvent,
  onBackButtonClick,
  adhocMeeting,
  invitationsSent,
  showOnlyLinkFields,
}: InviteToMeetingProps) => {
  const [creatEventInvitation, { isLoading: sendingInvitation }] = useCreateEventInviteMutation();

  const [deleteEvent] = useDeleteEventMutation();
  const features = useAppSelector(selectFeatures);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedUsers, setSelectedUsers] = useState<Array<ParticipantOption>>([]);

  const { data: tariff } = useGetMeTariffQuery();
  const userTariffLimit = tariff?.quotas.roomParticipantLimit;

  const sendInvitations = async () => {
    const allInvites = selectedUsers.map((selectedUser) => {
      const invitee =
        'id' in selectedUser ? { invitee: selectedUser.id, role: UserRole.USER } : { email: selectedUser.email };

      return creatEventInvitation(merge({ eventId: existingEvent.id }, invitee)).unwrap();
    });

    //RTK query mutations will be sent out individually regardless of us using all or allSettled.
    //This part is used to determine, which notification to show based on if at least one got rejected.
    const results = await Promise.allSettled(allInvites);
    if (results.some((result) => result.status === 'rejected')) {
      notifications.error(t('dashboard-direct-meeting-invitations-error'));
    } else {
      notifications.success(t('dashboard-direct-meeting-invitations-successful'));
    }

    invitationsSent && invitationsSent();
    setSelectedUsers([]);
  };

  const handleCancelMeetingPress = () => {
    if (adhocMeeting && isEvent(existingEvent)) {
      deleteEvent(existingEvent.id);
    }
    navigate('/dashboard/');
  };

  const addSelectedUser = (selected: ParticipantOption) => {
    setSelectedUsers((selectedUsers) => [...selectedUsers, selected]);
  };

  const removeSelectedUser = (removedUser: EventInvite) => {
    setSelectedUsers((selectedUsers) => selectedUsers.filter((user) => user.email !== removedUser.profile.email));
  };

  const selectParticipantsLabel = userTariffLimit
    ? t('dashboard-direct-meeting-label-select-participants', { maxParticipants: userTariffLimit })
    : t('dashboard-direct-meeting-label-select-participants-fallback');

  return (
    <Grid
      container
      direction="column"
      spacing={0}
      wrap="nowrap"
      sx={{
        justifyContent: 'space-between',
        overflow: 'auto',
        pt: 1,
      }}
    >
      <Grid container spacing={3} direction="row">
        <MeetingLinksAndPasswords event={existingEvent} />
        {!showOnlyLinkFields && features.userSearch && (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
              {features.userSearch && (
                <SelectParticipants
                  label={selectParticipantsLabel}
                  placeholder={t('dashboard-select-participants-textfield-placeholder')}
                  onParticipantSelect={addSelectedUser}
                  selectedUsers={selectedUsers}
                  invitees={existingEvent?.invitees}
                  eventId={existingEvent.id}
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 12 }}>
              <InvitedParticipants
                eventId={existingEvent.id}
                selectedUsers={selectedUsers}
                isUpdatable={isUpdatable}
                removeSelectedUser={removeSelectedUser}
                adhocMeeting={adhocMeeting}
              />
            </Grid>
          </>
        )}
      </Grid>
      {!showOnlyLinkFields && (
        <Grid
          container
          spacing={2}
          sx={{
            justifyContent: { xs: 'center', sm: 'space-between' },
          }}
        >
          <Grid size={{ xs: 12, sm: 'auto' }}>
            {onBackButtonClick && (
              <StepButton variant="text" color="secondary" startIcon={<BackIcon />} onClick={onBackButtonClick}>
                {t('dashboard-meeting-to-step', { step: 1 })}
              </StepButton>
            )}
          </Grid>
          <Grid
            container
            size={{ xs: 12, sm: 'auto' }}
            spacing={3}
            sx={{
              flexDirection: { xs: 'column-reverse', sm: 'row' },
              padding: 1,
            }}
          >
            <Grid>
              <Button fullWidth color="secondary" variant="outlined" onClick={handleCancelMeetingPress}>
                {t('global-cancel')}
              </Button>
            </Grid>
            <Grid>
              <Button
                component={Link}
                to={`/room/${existingEvent?.room.id}`}
                color="secondary"
                fullWidth
                target="_blank"
              >
                {t('dashboard-direct-meeting-button-open-room')}
              </Button>
            </Grid>
            {features.userSearch && (
              <Grid>
                <Button onClick={sendInvitations} disabled={!selectedUsers.length || sendingInvitation} fullWidth>
                  {t('dashboard-direct-meeting-button-send-invitations')}
                </Button>
              </Grid>
            )}
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default InviteToMeeting;
