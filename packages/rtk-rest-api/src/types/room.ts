// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Opaque } from 'type-fest';

import { CallIn, DateTime, BaseAsset, AssetId } from './common';
import { BaseUser } from './user';

export type RoomId = Opaque<string, 'roomId'>;
export type InviteCode = Opaque<string, 'inviteCode'>;
export type SipId = Opaque<string, 'sipId'>;

// RequestBodies

/**
 * New Room
 *
 * RequestBody of POST /rooms
 */
export type CreateRoomPayload = {
  password?: string;
  enableSip: boolean;
};

/**
 * Modify Room
 *
 * RequestBody of PATCH /rooms/{uuid}
 */
export type UpdateRoomPayload = {
  password?: string;
};

// Response Objects

/**
 * Public information about a room
 *
 * Usually retrieved by calling GET /rooms/{uuid}
 */
export type PublicRoom = {
  id: RoomId;
  createdAt: DateTime;
  createdBy: BaseUser;
};

// TODO(r.floren): Should we put them here into the same interface?
/**
 * Private information about a room
 * Usually retrieved by calling POST /rooms
 */
export type PrivateRoom = PublicRoom & {
  password?: string;
};

/**
 * Payload for creating or updating a SIP-Configuration
 *
 * password: Numeric string with exactly 10 characters to secure room access. Is automatically generated when not set on creation.
 * lobby: Enable/Disable a lobby for users that join through SIP. Defaults to false when not set on creation.
 */
export type UpdateRoomSipConfigPayload = {
  password?: string;
  lobby?: boolean;
};

export type RoomSipConfigResponse = {
  room: RoomId;
  password?: string;
  callIn: CallIn;
  lobby: boolean;
};

export type RoomAssets = Array<BaseAsset>;

export type RoomInvite = {
  inviteCode: InviteCode;
  room: string;
  active: boolean;
  expiration: DateTime | null;
  created: DateTime;
  createdBy: BaseUser;
  updated: DateTime;
  updatedBy: BaseUser;
};

export type RoomInvites = Array<RoomInvite>;

export type CreateRoomInvitePayload = {
  expiration?: DateTime;
};

export type RoomEventInfo = {
  id: RoomId;
  inviteCode?: InviteCode;
};

export type CreateRoomAssetPayload = {
  roomId: RoomId;
  fileBlob: Blob;
  fileExtension: 'svg' | 'png' | 'jpg' | 'jpeg' | 'pdf';
  kind: string;
  eventTitle?: string;
  namespace?: string;
};

export type CreateRoomAssetResponse = {
  filename: string;
  id: AssetId;
  size: number;
  remainingQuota: number | null;
};
