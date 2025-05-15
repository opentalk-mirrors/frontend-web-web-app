// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RoomId } from '@opentalk/rest-api-rtk-query';

export interface RoomInfo {
  id: RoomId;
  password: string;
  createdBy: {
    title: string;
    firstname: string;
    lastname: string;
    displayName: string;
    avatar_url: string;
  };
}
