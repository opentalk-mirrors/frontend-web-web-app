// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Dialog, DialogContent, DialogTitle, Stack, Typography, styled } from '@mui/material';
import { BackendModules, CoreFeatures, type EventInfo, type StreamingLink } from '@opentalk/rest-api-rtk-query';
import { MeetingDetails } from '@opentalk/rest-api-rtk-query/src/types/event';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { CloseIcon } from '../../../assets/icons';
import { CopyTextField, IconButton } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { selectCurrentBreakoutRoomId } from '../../../store/slices/breakoutSlice';
import { selectBaseUrl, selectIsFeatureEnabled } from '../../../store/slices/configSlice';
import { selectE2EEncryption } from '../../../store/slices/roomSlice';
import type { RoomInfo } from '../../../types';
import { composeInviteUrl } from '../../../utils/apiUtils';
import { FieldKeys } from '../../InviteToMeeting/fragments/constants';
import MeetingDetailsDialogActions from './MeetingDetailsDialogActions';

export type MeetingDetailsDialogProps = {
  eventInfo: EventInfo;
  meetingDetails: MeetingDetails;
  roomInfo: RoomInfo;
  open: boolean;
  onClose: () => void;
};

const SubTitle = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(12),
  fontWeight: 'normal',
  padding: theme.spacing(0, 3),
  marginTop: theme.spacing(-2),
}));

const CustomCopyTextField = styled(CopyTextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    background: 'transparent',
    color: theme.palette.text.primary,
  },
}));

const MeetingDetailsDialog = ({ open, onClose, eventInfo, meetingDetails, roomInfo }: MeetingDetailsDialogProps) => {
  const { t } = useTranslation();
  const { title, roomId } = eventInfo;
  const { createdBy: roomOwner, password: roomPassword } = roomInfo;
  const baseUrl = useAppSelector(selectBaseUrl);
  const currentBreakoutRoomId = useAppSelector(selectCurrentBreakoutRoomId);
  const isGuestsAllowedFeatureEnabled = useAppSelector(
    selectIsFeatureEnabled(BackendModules.Core, CoreFeatures.GuestsAllowed)
  );
  const inviteUrl = roomId
    ? composeInviteUrl(baseUrl, roomId, meetingDetails?.inviteCodeId, currentBreakoutRoomId)
    : null;
  const streamingLinksExist = meetingDetails !== undefined && meetingDetails.streamingLinks.length > 0;

  const getRoomOwnerNameString = () => `${roomOwner.firstname} ${roomOwner.lastname}`;
  const highSecurityEnabled = useAppSelector(selectE2EEncryption);

  const renderStreamingLinks = (streamingLinks: StreamingLink[]) => (
    <>
      <Typography variant="h2">{getLabelText(FieldKeys.LivestreamLink)}</Typography>
      {streamingLinks.map((streamingLink) => (
        <CopyTextField
          key="global-streaming-link"
          label={streamingLink.name}
          value={streamingLink.url}
          ariaLabel={getAriaLabelText(FieldKeys.LivestreamLink, streamingLink.name)}
          notificationText={getNotificationText(FieldKeys.LivestreamLink)}
          checked={inviteUrl ? copiedUrl === streamingLink.url : false}
          onClick={() => setCopiedUrl(streamingLink.url)}
        />
      ))}
    </>
  );

  const renderSubtitle = () => (
    <Trans
      i18nKey="meeting-details-dialog-subtitle"
      values={{ roomOwner: getRoomOwnerNameString() }}
      components={{ subtitle: <SubTitle />, strong: <strong /> }}
    />
  );
  const sipLink = meetingDetails?.callIn
    ? `${meetingDetails.callIn.tel},,${meetingDetails.callIn.id},,${meetingDetails.callIn.password}`
    : undefined;
  const getNotificationText = (fieldKey: FieldKeys) => t(`meeting-details-dialog-copy-${fieldKey}-success`);
  const getLabelText = (fieldKey: FieldKeys) => t(`meeting-details-dialog-label-${fieldKey}`);
  const getAriaLabelText = (fieldKey: FieldKeys, name?: string) =>
    t(`meeting-details-dialog-aria-label-${fieldKey}`, { name, eventTitle: title });

  const [copiedUrl, setCopiedUrl] = useState<string | undefined>('');

  useEffect(() => {
    if (open) {
      // Workaround to fix a visual glitch while closing the dialog
      setCopiedUrl('');
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" aria-labelledby="detail-invite-title">
      <DialogTitle aria-hidden="true" sx={{ width: '95%' }}>
        {t('meeting-details-dialog-title', { title })}
      </DialogTitle>
      {roomOwner && renderSubtitle()}
      <Box
        sx={{
          position: 'absolute',
          top: 5,
          right: 5,
        }}
      >
        <IconButton onClick={onClose} aria-label={t('global-close-dialog')}>
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent>
        <Stack spacing={2}>
          {isGuestsAllowedFeatureEnabled && !highSecurityEnabled && (
            <CustomCopyTextField
              label={getLabelText(FieldKeys.InviteLink)}
              value={inviteUrl?.toString()}
              ariaLabel={getAriaLabelText(FieldKeys.InviteLink)}
              notificationText={getNotificationText(FieldKeys.InviteLink)}
              checked={inviteUrl ? copiedUrl === inviteUrl.toString() : false}
              onClick={() => setCopiedUrl(inviteUrl?.toString())}
            />
          )}
          {sipLink && (
            <CustomCopyTextField
              label={getLabelText(FieldKeys.SipLink)}
              value={sipLink}
              ariaLabel={getAriaLabelText(FieldKeys.SipLink)}
              notificationText={getNotificationText(FieldKeys.SipLink)}
              checked={inviteUrl ? copiedUrl === sipLink : false}
              onClick={() => setCopiedUrl(sipLink)}
            />
          )}
          {roomPassword && (
            <CustomCopyTextField
              label={getLabelText(FieldKeys.RoomPassword)}
              value={roomPassword}
              ariaLabel={getAriaLabelText(FieldKeys.RoomPassword)}
              notificationText={getNotificationText(FieldKeys.RoomPassword)}
              checked={inviteUrl ? copiedUrl === roomPassword : false}
              onClick={() => setCopiedUrl(roomPassword)}
            />
          )}
          {streamingLinksExist && renderStreamingLinks(meetingDetails.streamingLinks)}
        </Stack>
      </DialogContent>
      <MeetingDetailsDialogActions
        title={title}
        roomPassword={roomPassword}
        meetingDetails={meetingDetails}
        inviteUrl={inviteUrl}
      />
    </Dialog>
  );
};

export default MeetingDetailsDialog;
