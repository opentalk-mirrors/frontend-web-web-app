// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { CoreFeatures, Event, GuestAccess } from '@opentalk/rest-api-rtk-query';

import { useGetRoomTariffQuery } from '../api/rest';
import { isFeatureEnabledPredicate } from '../utils/moduleUtils';

const useIsGuestAccessAllowed = (event: Event): boolean => {
  const { data: roomTariff } = useGetRoomTariffQuery(event.room.id);

  return Boolean(
    roomTariff &&
    isFeatureEnabledPredicate(CoreFeatures.GuestsAllowed, roomTariff.modules) &&
    !event.room.e2eEncryption &&
    event.room.guestAccess !== GuestAccess.Disabled
  );
};

export default useIsGuestAccessAllowed;
