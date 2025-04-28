// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { act, waitFor, renderHook } from '@testing-library/react';
import { setupServer } from 'msw/node';

import { createOpenTalkApiWithReactHooks } from '../endpoints';
import fetchQuery from '../fetchQuery';
import { EventId } from '../types';
import { camelcaseKeysDeep } from '../types/utils';
import { setupApiStore } from './helpers';
import { eventHandlers, generateMockEvent, userHandlers } from './mocks/server';

// This configures a request mocking server with the given request handlers.
const server = setupServer(...eventHandlers, ...userHandlers);
const api = createOpenTalkApiWithReactHooks(fetchQuery({ baseUrl: 'http://localhost/v1/' }));
const storeRef = setupApiStore(api);
const { useGetEventsQuery, useDeleteEventMutation } = api;

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

describe('Event Endpoints', () => {
  describe('GET', () => {
    it('should return multiple events', async () => {
      const { result } = renderHook(() => useGetEventsQuery({}), {
        wrapper: storeRef.wrapper,
      });

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      const { data: event } = result.current;
      expect(event?.data).toContainEqual(camelcaseKeysDeep(generateMockEvent(1, 'untimed')));
    });

    it('should be paginated', async () => {
      const { result } = renderHook(() => useGetEventsQuery({}), {
        wrapper: storeRef.wrapper,
      });

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      const { data: events } = result.current;
      expect(events?.after).toBeDefined();
    });

    it('should accept after cursor', async () => {
      const { result } = renderHook(() => useGetEventsQuery({ after: '1' }), {
        wrapper: storeRef.wrapper,
      });

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      const { data: events } = result.current;
      expect(events?.after).toBeDefined();
    });
  });

  describe('DELETE', () => {
    it('success useDeleteEventMutation', async () => {
      const { result } = renderHook(() => useDeleteEventMutation(), {
        wrapper: storeRef.wrapper,
      });
      const [deleteEvent] = result.current;

      act(() => {
        deleteEvent('SUCCESS' as EventId);
      });

      await waitFor(() => {
        expect(result.current[1].isSuccess).toBeTruthy();
      });

      const [, data] = result.current;
      expect(data.isError).toBeFalsy();
      expect(data.endpointName).toEqual('deleteEvent');
    });

    it('failing useDeleteEventMutation', async () => {
      const { result } = renderHook(() => useDeleteEventMutation(), {
        wrapper: storeRef.wrapper,
      });
      const [deleteEvent] = result.current;

      act(() => {
        deleteEvent('NOT_FOUND' as EventId);
      });

      await waitFor(() => {
        expect(result.current[1].isError).toBeTruthy();
      });

      const [, data] = result.current;
      expect(data.isSuccess).toBeFalsy();
      expect(data.endpointName).toEqual('deleteEvent');
      expect(data.error).toEqual({ status: 404, data: null });
    });
  });
});
