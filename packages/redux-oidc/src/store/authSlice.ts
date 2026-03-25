// move this to common
import { createAction, createSlice, ThunkDispatch } from '@reduxjs/toolkit';
import type { Action, UnknownAction } from '@reduxjs/toolkit';

import { AuthTypeError, SerializedError, SessionStatus, getSessionStatus } from '../utils';
import { codeCallback, getNewToken } from './authActions';

export let appDispatch: ThunkDispatch<unknown, unknown, Action | UnknownAction> | undefined;

// We must pass the app dispatch to the auth slice for proper typing
export const setupAppDispatch = (dispatch: ThunkDispatch<unknown, unknown, Action | UnknownAction>) => {
  appDispatch = dispatch;
};

export const getAppDispatch = () => {
  if (appDispatch) {
    return appDispatch;
  } else {
    throw new Error('[redux-oidc]: The dispatch function has not been setup');
  }
};

export interface AuthState {
  state: SessionStatus;
  loginTimestamp: string | undefined;
  loading: boolean;
  refreshTokenLoading: boolean;
  error: SerializedError | undefined;
}

/**
 * ### SessionStatus Machine Graph
 *	 Initial state = ANONYMOUS
 * - CodeCallback:
 *      PENDING -> PENDING -> Login to keyclock starts
 *      Success -> PENDING -> Login to controller starts
 * 		Failed  -> ANONYMOUS -> User gets redirected to login page
 * - Login:
 * 		PENDING -> PENDING | AUTHORIZED (depending if it's called after CodeCallback or getNewToken) -> Login to controller starts
 * 		Success -> AUTHORIZED -> Login finished successfully
 * 		Failed  -> ANONYMOUS -> User gets redirected to login page
 *
 *  - getNewToken:
 * 		Failed  -> ANONYMOUS -> User gets redirected to login page
 */

const initialState = {
  state: getSessionStatus(),
  loginTimestamp: undefined,
  refreshTokenLoading: false,
  loading: false,
} as AuthState;

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authorize: (state) => {
      state.state = SessionStatus.AUTHORIZED;
    },
    startLoading: (state) => {
      state.state = SessionStatus.PENDING;
    },
    logout: (state) => {
      state.state = SessionStatus.ANONYMOUS;
    },
    authError: (state, { payload }) => {
      state.error = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(codeCallback.pending, (state) => {
        state.error = undefined;
      })
      .addCase(codeCallback.fulfilled, (state) => {
        state.state = SessionStatus.AUTHORIZED;
        state.error = undefined;
        state.loginTimestamp = new Date().toISOString();
      })
      .addCase(codeCallback.rejected, (state, { payload }) => {
        state.state = SessionStatus.ANONYMOUS;
        state.error = payload as SerializedError;
      })
      .addCase(getNewToken.pending, (state) => {
        state.refreshTokenLoading = true;
        state.error = undefined;
      })
      .addCase(getNewToken.fulfilled, (state) => {
        state.refreshTokenLoading = false;
        state.error = undefined;
        state.state = SessionStatus.AUTHORIZED;
      })
      .addCase(getNewToken.rejected, (state, { payload }) => {
        state.refreshTokenLoading = false;
        state.error = payload as SerializedError;
        state.state = SessionStatus.ANONYMOUS;
      });
  },
});

export const saveLocationRedirect = createAction('auth/saveLocationRedirect', (payload: string) => ({ payload }));
export const { authorize, logout, startLoading, authError } = authSlice.actions;

export const getSavedLocation = () => sessionStorage.getItem('saved_location') || undefined;
export const selectIsRefreshTokenLoading = (state: { auth: AuthState }): boolean => state.auth.refreshTokenLoading;
export const selectLoginTimestamp = (state: { auth: AuthState }): string | undefined => state.auth.loginTimestamp;
export const selectIsUserInitialLogin = (state: { auth: AuthState }): boolean =>
  state.auth.loginTimestamp === undefined;
export const selectIsAuthenticated = (state: { auth: AuthState }): boolean =>
  state.auth.state === SessionStatus.AUTHORIZED;
export const selectAuthIsPending = (state: { auth: AuthState }): boolean => state.auth.state === SessionStatus.PENDING;
export const selectError = (state: { auth: AuthState }) => state.auth.error;
export const selectRefreshError = (state: { auth: AuthState }) =>
  state.auth.error?.name === AuthTypeError.RefreshTokenFailed;

export default authSlice.reducer;
