// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { authReducer } from '@opentalk/redux-oidc';
import { AnyAction, Dispatch, Middleware, MiddlewareAPI, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { merge } from 'lodash';

import { apiMiddleware } from '../api';
import { restApi, rtkQueryErrorLoggerMiddlware } from '../api/rest';
import automodReducer from './slices/automodSlice';
import breakoutReducer from './slices/breakoutSlice';
import chatReducer from './slices/chatSlice';
import { initialState as initialConfig } from './slices/configSlice';
import configReducer from './slices/configSlice';
import eventReducer from './slices/eventSlice';
import legalVoteReducer from './slices/legalVoteSlice';
import livekitReducer from './slices/livekitSlice';
import mediaReducer, {
  mediaMiddleware,
  initialState as InitialMediaState,
  reHydrateSlice as mediaRehydrateSlice,
} from './slices/mediaSlice';
import meetingNotesReducer from './slices/meetingNotesSlice';
import moderationReducer from './slices/moderationSlice';
import participantsReducer, { participantsMiddleware } from './slices/participantsSlice';
import pollReducer from './slices/pollSlice';
import roomReducer, { roomMiddleware } from './slices/roomSlice';
import sharedFolderReducer from './slices/sharedFolderSlice';
import slotReducer from './slices/slotSlice';
import speedMeterReducer from './slices/speedMeterSlice';
import streamingReducer from './slices/streamingSlice';
import subroomAudioReducer from './slices/subroomAudioSlice';
import timerReducer, { timerMiddleware } from './slices/timerSlice';
import uiReducer from './slices/uiSlice';
import userReducer from './slices/userSlice';
import whiteboardReducer from './slices/whiteboardSlice';

export const middleware: Array<Middleware> = [
  apiMiddleware,
  restApi.middleware,
  rtkQueryErrorLoggerMiddlware,
  timerMiddleware.middleware,
  roomMiddleware.middleware,
  participantsMiddleware.middleware,
  mediaMiddleware.middleware,
];

const logger = () => (next: Dispatch) => (action: AnyAction) => {
  if (!action.type.startsWith('stats/statsUpdated')) {
    const payloadJSON = action.payload ? `: ${JSON.stringify(action.payload)}` : '';
    const metaJSON = action.meta ? ` (meta: ${JSON.stringify(action.meta)}` : '';
    console.debug(`action: ${action.type}${payloadJSON}${metaJSON}`);
  }
  return next(action);
};

const crashReporter = (store: MiddlewareAPI) => (next: Dispatch) => (action: AnyAction) => {
  try {
    return next(action);
  } catch (err) {
    console.error('Caught an exception!', err, {
      action,
      state: store.getState(),
    });
    throw err;
  }
};

if (process.env.NODE_ENV === 'development') {
  middleware.push(logger);
  middleware.push(crashReporter);
}

export const appReducers = {
  auth: authReducer,
  automod: automodReducer,
  breakout: breakoutReducer,
  chat: chatReducer,
  config: configReducer,
  participants: participantsReducer,
  legalVote: legalVoteReducer,
  media: mediaReducer,
  moderation: moderationReducer,
  room: roomReducer,
  ui: uiReducer,
  user: userReducer,
  slot: slotReducer,
  speed: speedMeterReducer,
  poll: pollReducer,
  [restApi.reducerPath]: restApi.reducer,
  events: eventReducer,
  meetingNotes: meetingNotesReducer,
  timer: timerReducer,
  whiteboard: whiteboardReducer,
  streaming: streamingReducer,
  sharedFolder: sharedFolderReducer,
  livekit: livekitReducer,
  subroomAudio: subroomAudioReducer,
};

const store = configureStore({
  reducer: {
    ...appReducers,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ['meta.arg', 'meta.baseQueryMeta', 'meta.history', 'payload.conferenceContext'],
      },
    }).concat(middleware),
  preloadedState: {
    config: merge({}, initialConfig, window.config),
    media: merge({}, InitialMediaState, mediaRehydrateSlice()),
  },
});

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
