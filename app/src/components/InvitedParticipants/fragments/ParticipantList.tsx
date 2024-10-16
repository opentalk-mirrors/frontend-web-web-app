// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Grid, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import { EventInvite, InviteStatus } from '@opentalk/rest-api-rtk-query';
import { EventId } from '@opentalk/rest-api-rtk-query/src/types';
import { useTranslation } from 'react-i18next';

import { useRevokeEventUserInviteMutation, useRevokeEventUserInviteByEmailMutation } from '../../../api/rest';
import { isRegisteredUser } from '../../../utils/typeGuardUtils';
import UserRow from './UserRow';

const ParticipantListBox = styled(Stack)({
  alignItems: 'baseline',
  overflow: 'auto',
  maxHeight: '15rem',
  width: '100%',
});

type ParticipantListProps = {
  status: InviteStatus;
  invitees: Array<EventInvite>;
  isUpdatable: boolean;
  removeSelectedUser?: (invitee: EventInvite) => void;
  eventId: EventId;
};

const ParticipantList = ({ isUpdatable, status, invitees, removeSelectedUser, eventId }: ParticipantListProps) => {
  const [revokeUserInvite] = useRevokeEventUserInviteMutation();
  const [revokeUserInviteByEmail] = useRevokeEventUserInviteByEmailMutation();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const revokeInvitedUser = (user: EventInvite) => {
    if (isRegisteredUser(user.profile)) {
      revokeUserInvite({ eventId, userId: user.profile.id });
    } else {
      revokeUserInviteByEmail({ eventId, email: user.profile.email });
    }
  };
  return (
    <Grid item xs={12} sm={4} data-testid="ParticipantList">
      <Typography variant="body1" component="h3" mb={1}>
        {t(`dashboard-meeting-details-page-participant-${status}`)}
      </Typography>
      <ParticipantListBox direction={isMobile ? 'row' : 'column'} data-testid="ParticipantListBox">
        {invitees.map((eventInvite) => (
          <UserRow
            key={eventInvite.profile.email}
            eventId={eventId}
            isUpdatable={isUpdatable}
            eventInvite={eventInvite}
            onRevokeUserInvite={revokeInvitedUser}
            onRemoveUser={eventInvite.status === InviteStatus.Added ? removeSelectedUser : undefined}
          />
        ))}
      </ParticipantListBox>
    </Grid>
  );
};

export default ParticipantList;
