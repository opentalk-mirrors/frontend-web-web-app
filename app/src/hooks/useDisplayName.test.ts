// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { UserMe } from '@opentalk/rest-api-rtk-query';
import { renderHook } from '@testing-library/react';

import { useDisplayName } from './useDisplayName';

it("returns 'Unknown' when data is undefined", () => {
  const { result } = renderHook(() => useDisplayName(undefined));
  expect(result).toHaveProperty('current', 'global-unknown');
});

it('returns email local part when only email is provided', () => {
  const user = { email: 'test@domain.com' } as UserMe;
  const { result } = renderHook(() => useDisplayName(user));
  expect(result).toHaveProperty('current', 'test');
});

it('returns first name when it is provided', () => {
  const user = { firstname: 'John', email: 'test@domain.com' } as UserMe;
  const { result } = renderHook(() => useDisplayName(user));
  expect(result).toHaveProperty('current', 'John');
});

it('returns last name when only last name is provided', () => {
  const user = { lastname: 'Doe', email: 'test@domain.com' } as UserMe;
  const { result } = renderHook(() => useDisplayName(user));
  expect(result).toHaveProperty('current', 'Doe');
});

it('returns full name when both first and last names are provided', () => {
  const user = { firstname: 'John', lastname: 'Doe', email: 'test@domain.com' } as UserMe;
  const { result } = renderHook(() => useDisplayName(user));
  expect(result).toHaveProperty('current', 'John Doe');
});

it('returns display name when it is provided', () => {
  const user = { displayName: 'Johnny', firstname: 'John', lastname: 'Doe', email: 'test@domain.com' } as UserMe;
  const { result } = renderHook(() => useDisplayName(user));
  expect(result).toHaveProperty('current', 'Johnny');
});
