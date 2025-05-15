// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Event } from '@opentalk/rest-api-rtk-query';
import { isTimelessEvent } from '@opentalk/rest-api-rtk-query';
import { RecurrencePattern } from '@opentalk/rest-api-rtk-query';
import { TrainingParticipationReportParameterSet } from '@opentalk/rest-api-rtk-query/src/types/event';
import { addMinutes } from 'date-fns';

import roundToUpper30 from '../../../utils/roundToUpper30';
import { CommonFrequencies } from '../../../utils/rruleUtils';
import { DEFAULT_MINUTES_DIFFERENCE } from '../constants';

export const getInitialValues = (
  memoizedRecurrencePattern: RecurrencePattern | false,
  isWaitingRoomEnabledByDefault: boolean,
  existingEvent?: Event
) => {
  const defaultStartDate = roundToUpper30();
  const defaultEndDate = addMinutes(defaultStartDate, DEFAULT_MINUTES_DIFFERENCE);

  const getShowMeetingDetailsInitialValue = () => {
    if (!existingEvent) {
      return true;
    }
    return Boolean(existingEvent?.showMeetingDetails);
  };

  const trainingParticipationReportValue = existingEvent?.trainingParticipationReport
    ? {
        enabled: true,
        parameter: existingEvent.trainingParticipationReport as TrainingParticipationReportParameterSet,
      }
    : {
        enabled: false,
      };

  const getStreamingInitialValue = () => {
    return existingEvent?.streamingTargets
      ? {
          enabled: true,
          platform: existingEvent.streamingTargets[0],
        }
      : {
          enabled: false,
        };
  };

  const waitingRoomInitialValue = existingEvent?.room.waitingRoom ?? isWaitingRoomEnabledByDefault;

  return {
    title: existingEvent?.title,
    description: existingEvent?.description || '',
    waitingRoom: waitingRoomInitialValue,
    password: existingEvent?.room.password?.trim() || undefined,
    isTimeDependent: !existingEvent?.isTimeIndependent,
    startDate:
      (existingEvent && !isTimelessEvent(existingEvent) && existingEvent.startsAt?.datetime) ||
      defaultStartDate.toISOString(),
    endDate:
      (existingEvent && !isTimelessEvent(existingEvent) && existingEvent.endsAt?.datetime) ||
      defaultEndDate.toISOString(),
    recurrencePattern: memoizedRecurrencePattern || CommonFrequencies.NONE,
    isAdhoc: existingEvent && Boolean(existingEvent.isAdhoc),
    sharedFolder: (existingEvent?.sharedFolder && Boolean(existingEvent.sharedFolder)) || false,
    showMeetingDetails: getShowMeetingDetailsInitialValue(),
    streaming: getStreamingInitialValue(),
    e2eEncryption: existingEvent?.room.e2eEncryption || false,
    trainingParticipationReport: trainingParticipationReportValue,
  };
};
