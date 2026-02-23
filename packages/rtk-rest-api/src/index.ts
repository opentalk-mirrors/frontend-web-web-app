// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
export { createOpenTalkApi, createOpenTalkApiWithReactHooks } from './endpoints';
export { default as fetchQuery } from './fetchQuery';
export type {
  Namespaces,
  UserId,
  AssetId,
  Email,
  DateTimeWithTimezone,
  DateTime,
  Tags,
  PagePaginated,
  CursorPaginated,
  EntityBase,
  CallIn,
  BaseAsset,
} from './types/common';
export { InviteStatus, Tag } from './types/common';
export type { Modules, BackendFeatures, TariffId, Tariff } from './types/tariff';
export { RecordingFeatures, CoreFeatures } from './types/tariff';
export { BackendModules } from './types/tariff';
export type {
  StreamingTargetId,
  StreamingTarget,
  StreamingTargetInfo,
  StreamingTargetStatusInfo,
  StreamUpdatedMessage,
  StreamingTargetEntity,
  StreamErrorReason,
  StreamStatusInfo,
  RecordingStatusInfo,
} from './types/streaming';
export {
  StreamingKind,
  PlatformKind,
  RecordingStatus,
  StreamStatus,
  RecordingStatus as StreamingStatus,
} from './types/streaming';
export type { ThemeBasePalette, BasePalette } from './types/config';
export type {
  User,
  UserMe,
  BaseUser,
  UpdateMePayload,
  RegisteredUser,
  UnregisteredUser,
  UserOwnedAssets,
  UserOwnedAsset,
  ParticipantOption,
  EmailUser,
} from './types/user';
export { UserRole } from './types/user';
export type {
  RoomId,
  InviteCode,
  SipId,
  PublicRoom,
  PrivateRoom,
  UpdateRoomPayload,
  CreateRoomPayload,
  RoomAssets,
  RoomInvite,
} from './types/room';
export type {
  Event,
  TimelessEvent,
  SingleEvent,
  RecurringEvent,
  EventException,
  EventInstance,
  EventAndInstanceId,
  EventInstanceId,
  EventId,
  CreateEventPayload,
  CreateEventExceptionPayload,
  UpdateEventPayload,
  UpdateEventInstancePayload,
  TimedEvent,
  RecurrencePattern,
  SharedFolderData,
  EventInfo,
  MeetingDetails,
  StreamingLink,
  TrainingParticipationReportParameterSet,
} from './types/event';
export {
  isTimelessEvent,
  isSingleEvent,
  isRecurringEvent,
  isEventException,
  isEventInstance,
  isEvent,
  isPendingEvent,
  EventType,
  EventStatus,
  GuestAccess,
} from './types/event';
export type { EventInvite, CreateEventInvitePayload } from './types/eventInvite';
