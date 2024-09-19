// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, Stack, Typography, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { notificationAction, notifications } from '../../commonComponents';
import { getLivekitRoom } from '../../store/slices/livekitSlice';
import { generateUniqueId } from '../../utils/stringUtils';

interface CreateTalkingStickNotificationProps {
  currentId: string;
  unmutedId: string;
  passTalkingStick: () => void;
  lastSpeaker: boolean;
  isUnmuted: boolean;
  id?: string;
}

interface MuteUnmuteNotificationMessageProps {
  onUnmute: () => void;
  onNext: () => void;
  lastSpeaker: boolean;
  id?: string;
}

const CustomTypography = styled(Typography)({
  marginTop: 0,
  fontSize: '0.875rem',
});

export const createTalkingStickNotification = ({
  currentId,
  unmutedId,
  passTalkingStick,
  lastSpeaker,
  isUnmuted,
  id: propId,
}: CreateTalkingStickNotificationProps) => {
  const id = propId || generateUniqueId();
  const room = getLivekitRoom();

  if (isUnmuted) {
    return (
      <UnmutedNotificationMessage
        id={id}
        onNext={() => {
          passTalkingStick();
          notifications.close(unmutedId);
        }}
        lastSpeaker={lastSpeaker}
      />
    );
  }

  return (
    <MutedNotificationMessage
      id={id}
      onUnmute={() => {
        room.localParticipant.setMicrophoneEnabled(true);
        notifications.close(currentId);
        notificationAction({
          key: unmutedId,
          persist: true,
          variant: 'success',
          hideCloseButton: true,
          msg: (
            <UnmutedNotificationMessage
              id={id}
              onNext={() => {
                passTalkingStick();
                notifications.close(unmutedId);
              }}
              lastSpeaker={lastSpeaker}
            />
          ),
          SnackbarProps: {
            role: 'alert',
            'aria-labelledby': `${id}-title`,
          },
        });
      }}
      onNext={() => {
        passTalkingStick();
      }}
    />
  );
};

const MutedNotificationMessage = (props: Pick<MuteUnmuteNotificationMessageProps, 'onNext' | 'onUnmute' | 'id'>) => {
  const { t } = useTranslation();
  return (
    <Stack spacing={1}>
      <CustomTypography as="h3" mt={0} id={`${props.id}-title`}>
        {t('talking-stick-speaker-announcement')}
      </CustomTypography>
      <Box display="flex" gap={1}>
        <Button onClick={props.onUnmute} variant="contained" color="primary" fullWidth>
          {t('talking-stick-notification-unmute')}
        </Button>
        <Button onClick={props.onNext} variant="contained" color="secondary" fullWidth>
          {t('talking-stick-notification-next-speaker')}
        </Button>
      </Box>
    </Stack>
  );
};

const UnmutedNotificationMessage = (
  props: Pick<MuteUnmuteNotificationMessageProps, 'onNext' | 'lastSpeaker' | 'id'>
) => {
  const { t } = useTranslation();

  return (
    <Stack spacing={1}>
      <CustomTypography as="h3" id={`${props.id}-title`}>
        {t(
          props.lastSpeaker
            ? 'talking-stick-unmuted-notification-last-participant'
            : 'talking-stick-unmuted-notification'
        )}
      </CustomTypography>
      <Box display="flex" justifyContent="flex-end">
        <Button onClick={props.onNext} variant="contained" color="primary">
          {t('talking-stick-notification-next-speaker')}
        </Button>
      </Box>
    </Stack>
  );
};
