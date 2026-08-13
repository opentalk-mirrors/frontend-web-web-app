// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { InviteStatus } from '../types/common';
import { EventType, isPendingEvent } from '../types/event';

const makeEvent = (type: EventType, inviteStatus: InviteStatus, isTimeIndependent = false) =>
  ({ type, inviteStatus, isTimeIndependent }) as unknown as Parameters<typeof isPendingEvent>[0];

describe('isPendingEvent', () => {
  it('returns true for a pending single event', () => {
    expect(isPendingEvent(makeEvent(EventType.Single, InviteStatus.Pending))).toBe(true);
  });

  it('returns true for a pending recurring event', () => {
    expect(isPendingEvent(makeEvent(EventType.Recurring, InviteStatus.Pending))).toBe(true);
  });

  it('returns true for a pending timeless event', () => {
    expect(isPendingEvent(makeEvent(EventType.Single, InviteStatus.Pending, true))).toBe(true);
  });

  it('returns true for a pending recurring event instance', () => {
    expect(isPendingEvent(makeEvent(EventType.Instance, InviteStatus.Pending))).toBe(true);
  });

  it('returns false for an accepted event instance', () => {
    expect(isPendingEvent(makeEvent(EventType.Instance, InviteStatus.Accepted))).toBe(false);
  });

  it('returns false for an accepted recurring event', () => {
    expect(isPendingEvent(makeEvent(EventType.Recurring, InviteStatus.Accepted))).toBe(false);
  });

  it('returns false for an event exception', () => {
    expect(isPendingEvent(makeEvent(EventType.Exception, InviteStatus.Pending))).toBe(false);
  });
});
