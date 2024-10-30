// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { isSameDay } from 'date-fns';

import { useDateFormat } from '../../hooks';

interface EventTimePreviewProps {
  startDate: Date;
  endDate: Date;
}

const EventTimePreview = (props: EventTimePreviewProps) => {
  const { startDate, endDate } = props;
  const formattedStartDate = useDateFormat(startDate, 'date');
  const attributeStartDate = useDateFormat(startDate, 'attribute-date');
  const formattedStartTime = useDateFormat(startDate, 'time');
  const formattedEndTime = useDateFormat(endDate, 'time');

  const isInTheSameDay = isSameDay(startDate, endDate);

  const displayDate = isInTheSameDay ? formattedStartDate : null;

  return (
    <>
      {displayDate && <time dateTime={attributeStartDate}>{formattedStartDate}</time>}{' '}
      <time dateTime={formattedStartTime}>{formattedStartTime}</time>
      {' - '}
      <time dateTime={formattedEndTime}>{formattedEndTime}</time>
    </>
  );
};

export default EventTimePreview;
