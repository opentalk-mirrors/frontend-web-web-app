// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { authReducer, setupAppDispatch } from '@opentalk/redux-oidc';
import { Middleware, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { merge } from 'lodash';

import { apiMiddleware } from '../api';
import { restApi, rtkQueryErrorLoggerMiddleware } from '../api/rest';
import log, { setupLogLevel } from '../logger';
import { actionSanitizer, stateSanitizer } from './helper/sanitizer';
import { listenerMiddleware } from './listenerMiddleware';
import automodReducer from './slices/automodSlice';
import breakoutReducer from './slices/breakoutSlice';
import chatReducer from './slices/chatSlice';
import { initialState as initialConfig } from './slices/configSlice';
import configReducer from './slices/configSlice';
import eventReducer from './slices/eventSlice';
import { fullscreenActions, fullscreenReducer } from './slices/fullscreen/slice';
import { bindDomEventsToRedux } from './slices/hotkeys/eventBindings';
import { domFocusIn, domFocusOut, domKeyDown, domKeyUp } from './slices/hotkeys/slice';
import legalVoteReducer from './slices/legalVoteSlice';
import livekitReducer, { initialState as livekitInitialState } from './slices/livekitSlice';
import mediaReducer from './slices/mediaSlice';
import meetingNotesReducer from './slices/meetingNotesSlice';
import moderationReducer from './slices/moderationSlice';
import participantsReducer from './slices/participantsSlice';
import pollReducer from './slices/pollSlice';
import roomReducer from './slices/roomSlice';
import sharedFolderReducer from './slices/sharedFolderSlice';
import slotReducer from './slices/slotSlice';
import speedMeterReducer from './slices/speedMeterSlice';
import streamingReducer from './slices/streamingSlice';
import subroomAudioReducer from './slices/subroomAudioSlice';
import timerReducer from './slices/timerSlice';
import uiReducer from './slices/uiSlice';
import userReducer from './slices/userSlice';
import whiteboardReducer from './slices/whiteboardSlice';

export const middleware: Array<Middleware> = [
  apiMiddleware,
  restApi.middleware,
  rtkQueryErrorLoggerMiddleware,
  listenerMiddleware.middleware,
];

const crashReporter: Middleware = (store) => (next) => (action) => {
  try {
    return next(action);
  } catch (err) {
    log.error('Caught an exception!', err, {
      action,
      state: store.getState(),
    });
    throw err;
  }
};

if (process.env.NODE_ENV === 'development') {
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
  fullscreen: fullscreenReducer,
};

// disable action sanitizer for localTrack and room object to prevent Redux toolkit for doing excesive work

export const mediaRehydrateSlice = () => {
  const storageItem = localStorage.getItem('mediaChoices');
  if (storageItem !== null) {
    return JSON.parse(storageItem);
  }

  return undefined;
};

const store = configureStore({
  reducer: {
    ...appReducers,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'livekit/setLivekitRoom',
          'livekit/setLivekitWhisperRoom',
          'livekit/connectRoom',
          'media/changeLocalMedia',
          'media/changeMedia',
          domKeyDown.type,
          domKeyUp.type,
          domFocusIn.type,
          domFocusOut.type,
          fullscreenActions.request.type,
          fullscreenActions.toggle.type,
        ],
        ignoredActionPaths: [
          'meta.arg',
          'meta.baseQueryMeta',
          'meta.history',
          'payload.conferenceContext',
          'payload.track',
          'payload.room',
          'payload.element',
        ],
        ignoredPaths: ['livekit.room', 'livekit.whisperRoom', 'livekit.lobby', 'fullscreen.element'],
      },
    }).concat(middleware),
  preloadedState: {
    config: merge({}, initialConfig, window.config),
    livekit: merge({}, livekitInitialState, mediaRehydrateSlice()),
  },
  devTools: {
    stateSanitizer,
    actionSanitizer,
  },
});

// fixme called directly inside tests for some reason https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2746
if (import.meta.env.VITEST === undefined || import.meta.env.VITEST === 'false') {
  bindDomEventsToRedux(store.dispatch);
}

setupListeners(store.dispatch);

setupAppDispatch(store.dispatch);

setupLogLevel(store.getState().config.logLevel);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
