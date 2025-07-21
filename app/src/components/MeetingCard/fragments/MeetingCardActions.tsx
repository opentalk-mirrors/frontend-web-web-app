// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Event, isPendingEvent } from '@opentalk/rest-api-rtk-query';

import { MeetingActions, MeetingCardFragmentProps } from './MeetingActions';
import { PendingMeetingActions } from './PendingMeetingActions';

export const MeetingCardActions = ({ event, isMeetingCreator, highlighted }: MeetingCardFragmentProps) => {
  if (isPendingEvent(event)) {
    return <PendingMeetingActions event={event as Event} />;
  }

  return <MeetingActions event={event} isMeetingCreator={isMeetingCreator} highlighted={highlighted} />;
};
