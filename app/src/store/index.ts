// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { authReducer, setupAppDispatch } from '@opentalk/redux-oidc';
import { AnyAction, Middleware, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { merge } from 'lodash';

import { apiMiddleware } from '../api';
import { restApi, rtkQueryErrorLoggerMiddleware } from '../api/rest';
import log, { setupLogLevel } from '../logger';
import { changeLocalMedia, connectRoom, switchLocalDevice } from './commonActions';
import { listenerMiddleware } from './listenerMiddleware';
import automodReducer from './slices/automodSlice';
import breakoutReducer from './slices/breakoutSlice';
import chatReducer from './slices/chatSlice';
import { initialState as initialConfig } from './slices/configSlice';
import configReducer from './slices/configSlice';
import eventReducer from './slices/eventSlice';
import legalVoteReducer from './slices/legalVoteSlice';
import livekitReducer, { setLivekitRoom, initialState as livekitInitialState } from './slices/livekitSlice';
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
};

// disable action sanitizer for localTrack and room object to prevent Redux toolkit for doing excesive work
const actionSanitizer = <A extends AnyAction>(action: A) => {
  if (changeLocalMedia.fulfilled.match(action.type || switchLocalDevice.fulfilled.match(action))) {
    return { ...action, payload: { ...action.payload, videoTrackPublication: '<<LONG_BLOB>>' } };
  }
  if (setLivekitRoom.match(action.type)) {
    return { ...action, payload: { ...action.payload, room: '<<LONG_BLOB>>' } };
  }
  if (connectRoom.fulfilled.match(action.type)) {
    return { ...action, payload: { ...action.payload, room: '<<LONG_BLOB>>' } };
  }

  return action;
};

// disable state sanitizer for localTrack and room object to prevent Redux toolkit for doing excesive work
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stateSanitizer = (state: any) => {
  if (state.livekit.lobby.videoTrackPublication || state.livekit.lobby.audioTrackPublication) {
    return {
      ...state,
      livekit: {
        ...state.livekit,
        room: '<<Long_BLOB>>',
        lobby: { audioTrackPublication: '<<LONG_BLOB>>', videoTrackPublication: '<<LONG_BLOB>>' },
      },
    };
  }
  return state;
};

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
        ],
        ignoredActionPaths: [
          'meta.arg',
          'meta.baseQueryMeta',
          'meta.history',
          'payload.conferenceContext',
          'payload.track',
          'payload.room',
        ],
        ignoredPaths: ['livekit.room', 'livekit.whisperRoom', 'livekit.lobby'],
      },
    }).concat(middleware),
  preloadedState: {
    config: merge({}, initialConfig, window.config),
    livekit: merge({}, livekitInitialState, mediaRehydrateSlice()),
  },
  devTools: {
    stateSanitizer: stateSanitizer,
    actionSanitizer: actionSanitizer,
  },
});

setupListeners(store.dispatch);

setupAppDispatch(store.dispatch);

setupLogLevel(store.getState().config.logLevel);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
