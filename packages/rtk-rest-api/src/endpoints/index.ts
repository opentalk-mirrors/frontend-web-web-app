// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';
import { createApi as createReactApi } from '@reduxjs/toolkit/query/react';

import { tags } from '../types/common';
import { addConfigurationEndpoints } from './config';
import { addEventsEndpoints } from './events';
import { addRoomEndpoints } from './rooms';
import { addUserEndpoints } from './users';

/**
 * Create a API instance without any React Hooks
 * @param {BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta>} baseQuery The base query to use
 * @returns RTK-Query API instance
 */
// FIXME: Find a way to get a correct return type for this function when you can
// enable react hooks building via an options flag (e.g. creator = finalOptions.createHooks ? createReactApi : createApi; creator({buildQuery}))
// The problem is that we need to have the correct inclusion of typeof CoreModuleName vs. typeof CoreModuleName | typeof ReactHooksModuleName,
// depending on the set options to create or note create the react hooks.
export const createOpenTalkApi = (baseQuery: ReturnType<typeof fetchBaseQuery>) => {
  return createApi({
    baseQuery,
    tagTypes: tags,
    endpoints: (builder) => ({
      ...addRoomEndpoints(builder),
      ...addUserEndpoints(builder),
      ...addEventsEndpoints(builder),
      ...addConfigurationEndpoints(builder),
    }),
  });
};

/**
 * Create a API instance with React Hooks
 * @param {BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta>} baseQuery The base query to use
 * @returns RTK-Query API instance
 */
// FIXME: Mark this as deprecated and call through to createOpenTalkApi when the Fixme there is resolved
export const createOpenTalkApiWithReactHooks = (baseQuery: ReturnType<typeof fetchBaseQuery>) => {
  return createReactApi({
    baseQuery,
    tagTypes: tags,
    endpoints: (builder) => ({
      ...addRoomEndpoints(builder),
      ...addUserEndpoints(builder),
      ...addEventsEndpoints(builder),
      ...addConfigurationEndpoints(builder),
    }),
  });
};
