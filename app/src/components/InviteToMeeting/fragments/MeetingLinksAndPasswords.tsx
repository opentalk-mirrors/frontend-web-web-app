// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Event, PlatformKind } from '@opentalk/rest-api-rtk-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../../../hooks';
import useIsGuestAccessAllowed from '../../../hooks/useIsGuestAccessAllowed';
import { selectBaseUrl } from '../../../store/slices/configSlice';
import GuestLinkField from './GuestLinkField';
import MeetingLinkField from './MeetingLinkField';
import { FieldKeys } from './constants';

interface MeetingLinksAndPasswordsProps {
  event: Event;
}

const MeetingLinksAndPasswords = ({ event }: MeetingLinksAndPasswordsProps) => {
  const { t } = useTranslation();
  const baseURL = useAppSelector(selectBaseUrl);
  const [highlightedField, setHighlightedField] = useState<FieldKeys>();

  const roomId = event.room.id;
  const isInviteAllowed = useIsGuestAccessAllowed(event);

  const roomURL = useMemo(() => new URL(`/room/${roomId}`, baseURL), [baseURL, roomId]);
  const eventTitle = event?.title || t('fallback-room-title');

  const roomSharedFolderURL = event.sharedFolder?.readWrite?.url;
  const roomSharedFolderPassword = event.sharedFolder?.readWrite?.password;
  const callInDetails = event.room.callIn;
  const sipLink = callInDetails ? `${callInDetails.tel},,${callInDetails.id},,${callInDetails.password}` : undefined;

  const roomPassword = event.room.password?.trim() || undefined;

  const streamingTargets = event.streamingTargets;
  const streamingTargetURL = useMemo(() => {
    if (!streamingTargets || !streamingTargets[0]) {
      return undefined;
    }

    const target = streamingTargets[0];
    switch (target.kind) {
      case PlatformKind.Custom:
      case PlatformKind.Provider:
        return target.publicUrl;
      case PlatformKind.BuiltIn:
      default:
        return undefined;
    }
  }, [streamingTargets]);

  return (
    <>
      <MeetingLinkField
        fieldKey={FieldKeys.RoomLink}
        checked={highlightedField === FieldKeys.RoomLink}
        value={roomURL}
        setHighlightedField={setHighlightedField}
        tooltip={t('dashboard-invite-to-meeting-room-link-tooltip')}
        eventTitle={eventTitle}
      />
      {callInDetails && sipLink && (
        <MeetingLinkField
          fieldKey={FieldKeys.SipLink}
          checked={highlightedField === FieldKeys.SipLink}
          value={sipLink}
          setHighlightedField={setHighlightedField}
          eventTitle={eventTitle}
        />
      )}
      {isInviteAllowed && (
        <GuestLinkField
          fieldKey={FieldKeys.GuestLink}
          checked={highlightedField === FieldKeys.GuestLink}
          setHighlightedField={setHighlightedField}
          tooltip={t('dashboard-invite-to-meeting-guest-link-tooltip')}
          eventTitle={eventTitle}
          eventCreatorId={event.createdBy.id}
          roomId={roomId}
          baseURL={baseURL}
        />
      )}
      <MeetingLinkField
        fieldKey={FieldKeys.RoomPassword}
        checked={highlightedField === FieldKeys.RoomPassword}
        value={roomPassword}
        setHighlightedField={setHighlightedField}
        tooltip={t('dashboard-invite-to-meeting-room-password-tooltip')}
        eventTitle={eventTitle}
      />
      {roomSharedFolderURL && (
        <>
          <MeetingLinkField
            fieldKey={FieldKeys.SharedFolderLink}
            checked={highlightedField === FieldKeys.SharedFolderLink}
            value={roomSharedFolderURL}
            setHighlightedField={setHighlightedField}
            eventTitle={eventTitle}
          />
          <MeetingLinkField
            fieldKey={FieldKeys.SharedFolderPassword}
            checked={highlightedField === FieldKeys.SharedFolderPassword}
            value={roomSharedFolderPassword}
            setHighlightedField={setHighlightedField}
            eventTitle={eventTitle}
          />
        </>
      )}
      {streamingTargetURL && (
        <MeetingLinkField
          fieldKey={FieldKeys.LivestreamLink}
          checked={highlightedField === FieldKeys.LivestreamLink}
          value={streamingTargetURL}
          setHighlightedField={setHighlightedField}
          eventTitle={eventTitle}
        />
      )}
    </>
  );
};

export default MeetingLinksAndPasswords;
