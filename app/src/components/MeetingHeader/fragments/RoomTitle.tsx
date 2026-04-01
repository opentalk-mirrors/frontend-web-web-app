// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack, Tooltip, Typography, styled } from '@mui/material';
import { truncate } from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { InfoButton } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { selectRoomTitle } from '../../../store/selectors';
import { selectEventInfo, selectMeetingDetails, selectRoomInfo } from '../../../store/slices/roomSlice';
import MeetingDetailsDialog from './MeetingDetailsDialog';
import { ROOM_TITLE_MAX_LENGTH } from './constants';

//Container is needed in order to limit text from overflowing
const Container = styled(Stack)(({ theme }) => ({
  background: theme.palette.background.customPaper.primary,
  color: theme.palette.background.customPaper.contrastText,
  borderRadius: '0.25rem',
  justifyContent: 'center',
  alignItems: 'center',
  height: theme.spacing(5),
  [theme.breakpoints.down('md')]: {
    height: '100%',
  },
}));

const RoomTitleTypography = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(0, 1),
  fontSize: theme.typography.pxToRem(14),
  fontWeight: 500,
  maxWidth: '100%',
}));

const RoomTitle = () => {
  const { t } = useTranslation();
  const eventInfo = useAppSelector(selectEventInfo);
  const meetingDetails = useAppSelector(selectMeetingDetails);
  const roomInfo = useAppSelector(selectRoomInfo);
  const [meetingDetailsDialogOpen, setMeetingDetailsDialogOpen] = useState(false);

  const title = useAppSelector(selectRoomTitle);

  const truncatedTitle = truncate(title, { length: ROOM_TITLE_MAX_LENGTH });

  return (
    <Container direction="row">
      <Tooltip translate="no" title={title} describeChild>
        <RoomTitleTypography noWrap translate="no" variant="h1">
          {truncatedTitle}
        </RoomTitleTypography>
      </Tooltip>
      {roomInfo && meetingDetails && eventInfo && (
        <>
          <InfoButton
            aria-label={t('room-title-info-button-aria-label')}
            onClick={() => setMeetingDetailsDialogOpen(true)}
          />
          <MeetingDetailsDialog
            eventInfo={eventInfo}
            meetingDetails={meetingDetails}
            roomInfo={roomInfo}
            open={meetingDetailsDialogOpen}
            onClose={() => setMeetingDetailsDialogOpen(false)}
          />
        </>
      )}
    </Container>
  );
};

export default RoomTitle;
