// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useGetMeQuery } from '../../api/rest';
import { MeetingCardProps } from './fragments/MeetingActions';
import OverviewCard from './fragments/OverviewCard';
import StandardCard from './fragments/StandardCard';

const MeetingCard = ({ event, overview, highlighted }: MeetingCardProps) => {
  const { data: me } = useGetMeQuery();
  const isMeetingCreator = me?.id === event.createdBy.id;

  return overview ? (
    <OverviewCard event={event} isMeetingCreator={isMeetingCreator} highlighted={highlighted} />
  ) : (
    <StandardCard event={event} isMeetingCreator={isMeetingCreator} highlighted={highlighted} />
  );
};

export default MeetingCard;
