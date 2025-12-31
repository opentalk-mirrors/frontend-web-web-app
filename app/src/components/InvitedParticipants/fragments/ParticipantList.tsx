// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Grid, Stack, Typography, useMediaQuery, useTheme, styled } from '@mui/material';
import { EventInvite, InviteStatus } from '@opentalk/rest-api-rtk-query';
import type { EventId, RegisteredUser } from '@opentalk/rest-api-rtk-query';
import { useTranslation } from 'react-i18next';

import { useRevokeEventUserInviteMutation, useRevokeEventUserInviteByEmailMutation } from '../../../api/rest';
import { isRegisteredUser } from '../../../utils/typeGuardUtils';
import UserRow from './UserRow';

const ParticipantListBox = styled(Stack)(({ theme }) => ({
  alignItems: 'baseline',
  overflow: 'auto',
  maxHeight: '15rem',
  width: '100%',
  color: theme.palette.text.primary,
}));

type ParticipantListProps = {
  status: InviteStatus;
  invitees: Array<EventInvite>;
  isUpdatable: boolean;
  removeSelectedUser?: (invitee: EventInvite) => void;
  onGrantRevokeModerator?: (user: RegisteredUser) => void;
  eventId: EventId;
};

const ParticipantList = ({
  isUpdatable,
  status,
  invitees,
  removeSelectedUser,
  onGrantRevokeModerator,
  eventId,
}: ParticipantListProps) => {
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
    <Grid size={{ xs: 12, sm: 4 }} data-testid="ParticipantList">
      <Typography
        variant="body1"
        component="h3"
        sx={{
          mb: 1,
        }}
      >
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
            onGrantRevokeModerator={onGrantRevokeModerator}
          />
        ))}
      </ParticipantListBox>
    </Grid>
  );
};

export default ParticipantList;
