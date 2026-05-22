// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Namespaces } from '@opentalk/rest-api-rtk-query';

import { getCurrentConferenceRoom } from '../../../modules/WebRTC/ConferenceRoom';
import type { Namespaced } from '../../../types';
import type { Action as OutgoingActionType, Message as OutgoingMessageType } from './index';

export interface ClearGlobalMessages {
  action: 'clear_history';
}

export const sendMessage = (message: Namespaced<OutgoingActionType | ClearGlobalMessages, Namespaces>) => {
  const conferenceContext = getCurrentConferenceRoom();
  if (conferenceContext === undefined) {
    throw new Error('can not send message to conferenceContext');
  }
  conferenceContext.sendMessage(message as OutgoingMessageType /*TODO remove conversion*/);
};
