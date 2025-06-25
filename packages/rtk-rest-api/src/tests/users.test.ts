// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { act, waitFor, renderHook } from '@testing-library/react';
import { setupServer } from 'msw/node';

import { createOpenTalkApiWithReactHooks } from '../endpoints';
import fetchQuery from '../fetchQuery';
import { EventId } from '../types/event';
import { camelcaseKeysDeep } from '../types/utils';
import { setupApiStore } from './helpers';
import { eventHandlers, generateMockUser, userHandlers } from './mocks/server';

// This configures a request mocking server with the given request handlers.
const server = setupServer(...eventHandlers, ...userHandlers);

// Establish API mocking before all tests.
const api = createOpenTalkApiWithReactHooks(
  fetchQuery({
    baseUrl: 'http://localhost/v1/',
  })
);

const storeRef = setupApiStore(api);

beforeAll(() => {
  server.listen();
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

describe('users', () => {
  describe('useGetMeQuery', () => {
    it('should return event', async () => {
      const { useGetMeQuery } = api;
      const { result } = renderHook(() => useGetMeQuery(), {
        wrapper: storeRef.wrapper,
      });

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      const { data: me } = result.current;
      expect(me).toEqual(camelcaseKeysDeep({ ...generateMockUser(1), theme: 'string', language: 'string' }));
    });
  });

  describe('useFindUsersQuery', () => {
    it('should return users', async () => {
      const { useFindUsersQuery } = api;
      const { result } = renderHook(() => useFindUsersQuery({ q: 'Number 2' }), {
        wrapper: storeRef.wrapper,
      });

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      const { data: users } = result.current;
      expect(users).toContainEqual(camelcaseKeysDeep({ ...generateMockUser(2) }));
    });
  });

  describe('useMarkFavoriteEventMutation', () => {
    it('mark event successful', async () => {
      const { useMarkFavoriteEventMutation } = api;
      const { result } = renderHook(() => useMarkFavoriteEventMutation(), {
        wrapper: storeRef.wrapper,
      });
      const [markEvent] = result.current;

      act(() => {
        markEvent('SUCCESS' as EventId);
      });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBeTruthy();
      });

      const [, data] = result.current;
      expect(data.isError).toBeFalsy();
      expect(data.endpointName).toEqual('markFavoriteEvent');
    });

    it('mark event unsuccessful', async () => {
      const { useMarkFavoriteEventMutation } = api;
      const { result } = renderHook(() => useMarkFavoriteEventMutation(), {
        wrapper: storeRef.wrapper,
      });
      const [markEvent] = result.current;

      act(() => {
        markEvent('NOT_FOUND' as EventId);
      });

      await waitFor(() => {
        expect(result.current[1].isError).toBeTruthy();
      });

      const [, data] = result.current;
      expect(data.isSuccess).toBeFalsy();
      expect(data.endpointName).toEqual('markFavoriteEvent');
      expect(data.error).toEqual({ status: 404, data: null });
    });
  });

  describe('useUnmarkFavoriteEventMutation', () => {
    it('mark event successful', async () => {
      const { useUnmarkFavoriteEventMutation } = api;
      const { result } = renderHook(() => useUnmarkFavoriteEventMutation(), {
        wrapper: storeRef.wrapper,
      });
      const [unmarkEvent] = result.current;

      act(() => {
        unmarkEvent('SUCCESS' as EventId);
      });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBeTruthy();
      });

      const [, data] = result.current;
      expect(data.isError).toBeFalsy();
      expect(data.endpointName).toEqual('unmarkFavoriteEvent');
    });

    it('mark event unsuccessful', async () => {
      const { useUnmarkFavoriteEventMutation } = api;
      const { result } = renderHook(() => useUnmarkFavoriteEventMutation(), {
        wrapper: storeRef.wrapper,
      });
      const [unmarkEvent] = result.current;

      act(() => {
        unmarkEvent('NOT_FOUND' as EventId);
      });

      await waitFor(() => {
        expect(result.current[1].isError).toBeTruthy();
      });

      const [, data] = result.current;
      expect(data.isSuccess).toBeFalsy();
      expect(data.endpointName).toEqual('unmarkFavoriteEvent');
      expect(data.error).toEqual({ status: 404, data: null });
    });
  });
});
