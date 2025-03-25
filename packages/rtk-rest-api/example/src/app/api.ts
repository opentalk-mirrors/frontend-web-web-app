// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  // highlight-start
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  tagTypes: ['Events'],
  endpoints: (_build) => ({}),
});
