// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BaseAsset } from './common';
import type { Email, UserId } from './common';
import type { EventId } from './event';
import type { RoomId } from './room';

// FIXME: This needs an overhaul after we added all ne new settings related endpoints
// Request Bodies

/**
 * Modifies the own user
 *
 * RequestBody for PATCH /me
 */
export type UpdateMePayload = {
  title?: string;
  theme?: string;
  language?: string;
  displayName?: string;
  conferenceTheme?: string;
  dashboardTheme?: string;
};

// Response Objects

type UserFindType = {
  kind?: 'unregistered' | 'registered';
};

export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
}

/**
 * Public User information
 *
 * Part of other embedded responses that reference a user.
 * E.g. GET /events
 */
export type BaseUser = {
  id: UserId;
  displayName: string;
  email: Email;
  title: string;
  firstname: string;
  lastname: string;
  avatarUrl?: string;
};

export type RegisteredUser = BaseUser & UserFindType & { role: UserRole };
export type UnregisteredUser = {
  email: Email;
  title: string;
  firstname: string;
  lastname: string;
  avatarUrl?: string;
} & UserFindType;

/**
 * Public User information
 *
 * Part of other embedded responses that reference a user.
 * GET /users/find?q=
 */
export type User = RegisteredUser | UnregisteredUser;

/**
 * Private User Information
 *
 * Usually retrieved by calling GET /me
 */
export type UserMe = BaseUser & {
  conferenceTheme: string;
  dashboardTheme: string;
  language: string;
  tariffStatus: TariffStatus;
  usedStorage: number;
};

type TariffStatus = 'paid' | 'downgraded' | 'default';

export type RevokeEmailUserPayload = { email: Email };

export type UserOwnedAsset = BaseAsset & {
  roomId: RoomId;
  eventId: EventId;
};

export type UserOwnedAssets = {
  ownedAssets: Array<UserOwnedAsset>;
};
