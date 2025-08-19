// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { UserId, RoomId } from '@opentalk/rest-api-rtk-query';
import { useEffect } from 'react';

import { useCreateRoomInviteMutation, useGetMeQuery, useGetRoomInvitesQuery } from '../../../api/rest';
import { composeInviteUrl } from '../../../utils/apiUtils';
import { findPermanentRoomInvite } from '../../../utils/apiUtils';
import MeetingLinkField from './MeetingLinkField';
import type { MeetingLinkFieldProps } from './MeetingLinkField';

export type GuestLinkFieldProps = {
  eventCreatorId: UserId;
  roomId: RoomId;
  baseURL: string;
} & MeetingLinkFieldProps;

const GuestLinkField = (props: GuestLinkFieldProps) => {
  const { eventCreatorId, roomId, baseURL } = props;

  const { data: me } = useGetMeQuery();
  const isCreator = me?.id === eventCreatorId;

  const [createRoomInvite] = useCreateRoomInviteMutation();
  const { data: invites, isLoading, isFetching } = useGetRoomInvitesQuery({ roomId });

  const permanentInvite = invites && findPermanentRoomInvite(invites);
  const permanentGuestLink = permanentInvite
    ? composeInviteUrl(baseURL, roomId, permanentInvite.inviteCode)
    : undefined;

  // Create a permanent guest link if it doesn't exist yet
  // and the user is the creator of the event
  useEffect(() => {
    if (isLoading || isFetching || permanentInvite) {
      return;
    }
    if (isCreator) {
      createRoomInvite({ id: roomId });
      return;
    }
  }, [permanentInvite, isLoading, isFetching, isCreator, createRoomInvite, roomId]);

  return <MeetingLinkField {...props} value={permanentGuestLink} isLoading={isLoading || isFetching} />;
};

export default GuestLinkField;
