// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { http, HttpResponse } from 'msw';

import { Event } from '../../../dist/esm';
import { addMeeting } from '../app/eventsSlice';
import { store } from '../app/store';

export const handlers = [
  http.get('/events', () => {
    const storedEvents = store.getState().events;
    let data: Event[] = [];
    Object.entries(storedEvents.entities).forEach((event) => {
      data.push(event[1] as Event);
    });
    console.log('data', data);
    return HttpResponse.json({ data });
  }),

  http.post('/events', async ({ request }) => {
    const body = await request.json();
    store.dispatch(addMeeting(body));
    return HttpResponse.json({ message: 'success' });
  }),
];
