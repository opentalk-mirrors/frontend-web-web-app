// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../../hooks';
import { selectMeetingNotesUrl } from '../../store/slices/meetingNotesSlice';

const MeetingNotesIframe = styled('iframe')({
  height: '100%',
  width: '100%',
  display: 'block',
  border: 0,
});

const MeetingNotesView = () => {
  const { t } = useTranslation();
  const meetingNotesUrl = useAppSelector(selectMeetingNotesUrl);
  return meetingNotesUrl ? (
    <MeetingNotesIframe
      src={meetingNotesUrl.toString()}
      aria-label={t('moderationbar-button-meeting-notes-tooltip')}
      title={t('moderationbar-button-meeting-notes-tooltip')}
    />
  ) : null;
};

export default MeetingNotesView;
