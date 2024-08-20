// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Chip, IconButton, Menu, MenuItem, Stack, Typography, styled } from '@mui/material';
import { EventId, EventInvite, InviteStatus, UserRole } from '@opentalk/rest-api-rtk-query';
import { RegisteredUser, User } from '@opentalk/rest-api-rtk-query/src/types/user';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetEventQuery, useGetMeQuery, useUpdateEventInviteMutation } from '../../../api/rest';
import { CloseIcon, ModeratorIcon as CommonModeratorIcon, MoreIcon } from '../../../assets/icons';
import { ParticipantAvatar, setLibravatarOptions } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { selectLibravatarDefaultImage } from '../../../store/slices/configSlice';
import { convertStringToColorHex } from '../../../utils/colorUtils';
import { isRegisteredUser } from '../../../utils/typeGuardUtils';
import { isModerator } from '../../../utils/userUtils';

const StyledChip = styled(Chip)({
  marginRight: 0,
  borderColor: 'transparent',
  backgroundColor: 'transparent',
  '& .MuiSvgIcon-root': {
    fontSize: '0.7rem',
  },
  minHeight: '3rem',
});

const ModeratorIcon = styled(CommonModeratorIcon, { shouldForwardProp: (prop) => prop !== 'visible' })<{
  visible: boolean;
}>(({ visible }) => ({
  '&.MuiSvgIcon-root': {
    fontSize: '1.25rem',
  },
  visibility: !visible ? 'hidden' : 'unset',
}));

type UserRowProps = {
  eventInvite: EventInvite;
  onRevokeUserInvite?: (invitee: EventInvite) => void;
  onRemoveUser?: (invitee: EventInvite) => void;
  isUpdatable: boolean;
  eventId: EventId;
};

const UserRow = ({ isUpdatable, eventInvite, onRevokeUserInvite, onRemoveUser, eventId }: UserRowProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const avatarDefaultImage = useAppSelector(selectLibravatarDefaultImage);
  const [updateEventInvite] = useUpdateEventInviteMutation();
  const { data: event, isLoading: isLoadingEvent } = useGetEventQuery({ eventId, inviteesMax: 0 });
  const { data: userMe, isLoading: isLoadingUserMe } = useGetMeQuery();
  const { t } = useTranslation();

  const isCreator = event && userMe && event.createdBy.id === userMe.id;

  const color = convertStringToColorHex('');
  const setAvatarSrc = (url: string | undefined) => {
    return setLibravatarOptions(url, { defaultImage: avatarDefaultImage });
  };

  const handleMoreIconClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMoreMenuClose = () => {
    setAnchorEl(null);
    setIsHovered(false);
  };

  const onDelete = () => {
    if (onRemoveUser) {
      return onRemoveUser(eventInvite);
    }
    if (onRevokeUserInvite) {
      return onRevokeUserInvite(eventInvite);
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'invite-more-menu' : undefined;

  const renderMoreIcon = (user: RegisteredUser) =>
    isCreator && isUpdatable ? (
      <>
        <IconButton
          data-testid="MoreIconButton"
          aria-label={t('more-menu-moderator-aria-label')}
          aria-controls={id}
          size="small"
          onClick={handleMoreIconClick}
        >
          <MoreIcon />
        </IconButton>
        <Menu
          data-testid="MoreMenu"
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleMoreMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <MenuItem
            onClick={() =>
              updateEventInvite({
                userId: user.id,
                eventId,
                role: user.role === UserRole.USER ? UserRole.MODERATOR : UserRole.USER,
              })
            }
          >
            {user.role === UserRole.MODERATOR
              ? t('dashboard-meeting-revoke-moderator-rights')
              : t('dashboard-meeting-grant-moderator-rights')}
          </MenuItem>
        </Menu>
      </>
    ) : null;

  const getLabel = (profile: User) => {
    if (isRegisteredUser(profile)) {
      return `${profile.firstname} ${profile.lastname}`;
    }
    return profile.email;
  };

  const renderLabel = (eventInvite: EventInvite) => {
    if (isRegisteredUser(eventInvite.profile)) {
      return (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" noWrap>
            {getLabel(eventInvite.profile)}
          </Typography>
          {isHovered && isUpdatable && isCreator && eventInvite.status !== InviteStatus.Added ? (
            renderMoreIcon(eventInvite.profile)
          ) : (
            <ModeratorIcon color="secondary" visible={isModerator(eventInvite.profile)} />
          )}
        </Stack>
      );
    }
    return (
      <Typography variant="body2" noWrap>
        {eventInvite.profile.email}
      </Typography>
    );
  };

  const renderAvatar = (eventInvite: EventInvite) =>
    eventInvite.status !== InviteStatus.Added || isRegisteredUser(eventInvite.profile) ? (
      <ParticipantAvatar src={setAvatarSrc(eventInvite.profile.avatarUrl)} />
    ) : (
      <ParticipantAvatar style={{ fontSize: '1.2rem', color: color }} specialCharacter="@" />
    );

  if (isLoadingEvent || isLoadingUserMe) {
    return null;
  }

  return (
    <StyledChip
      data-testid="UserRow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMoreMenuClose}
      key={eventInvite.profile.email}
      label={renderLabel(eventInvite)}
      avatar={renderAvatar(eventInvite)}
      deleteIcon={
        <CloseIcon
          aria-label={t('dashboard-invite-to-meeting-delete-participant-label', {
            name: getLabel(eventInvite.profile),
          })}
        />
      }
      onDelete={isHovered && isUpdatable ? onDelete : undefined}
    />
  );
};

export default UserRow;
