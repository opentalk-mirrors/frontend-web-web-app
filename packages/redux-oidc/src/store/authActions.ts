import { createAsyncThunk } from '@reduxjs/toolkit';
import camelcaseKeys from 'camelcase-keys';
import convertToSnakeCase from 'snakecase-keys';

import { AuthTypeError, generateSerilizadError, storeToken } from '../utils';

export interface LoginProps {
  baseUrl: string;
}

export interface CodeCallBackProps {
  clientId: string;
  redirectUri: string;
  code: string;
  tokenEndpoint: string;
  baseUrl?: string;
}

export const codeCallback = createAsyncThunk(
  'auth/code_callback',
  async (payload: CodeCallBackProps, { rejectWithValue }) => {
    try {
      const codeVerifier = sessionStorage.getItem('code_verifier');
      const urlSearchParams = {
        grantType: 'authorization_code',
        clientId: payload.clientId,
        redirectUri: payload.redirectUri,
        code: payload.code,
        codeVerifier: codeVerifier || '',
      };

      const response = await fetch(payload.tokenEndpoint, {
        method: 'POST',
        body: new URLSearchParams(convertToSnakeCase(urlSearchParams)),
      });

      if (!response.ok) {
        return rejectWithValue(
          generateSerilizadError({
            name: AuthTypeError.CodeCallbackFailed,
            message: response.statusText,
            status: response.status,
          })
        );
      }

      const data = camelcaseKeys(await response.json(), { deep: true });
      storeToken(data);

      return data;
    } catch (error) {
      if (error instanceof SyntaxError) {
        // Unexpected token < in JSON
        console.debug('There was a SyntaxError', error);
        throw new Error(String(error));
      }
      return rejectWithValue(
        generateSerilizadError({
          name: AuthTypeError.CodeCallbackFailed,
          message: 'Unable to fetch code callback api',
          status: 503,
        })
      );
    }
  }
);

interface RefreshTokenInterface {
  clientId: string;
  tokenEndpoint: string;
  baseUrl?: string;
}
export const getNewToken = createAsyncThunk(
  'auth/get_new_token',
  async (payload: RefreshTokenInterface, { rejectWithValue }) => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.debug('No refresh token found');
      return rejectWithValue(
        generateSerilizadError({
          name: AuthTypeError.RefreshTokenFailed,
          message: 'Refresh token not present',
          status: 503,
        })
      );
    }
    try {
      const response = await fetch(payload.tokenEndpoint, {
        body: new URLSearchParams(
          convertToSnakeCase({
            grantType: 'refresh_token',
            clientId: payload.clientId,
            refreshToken: refreshToken,
          })
        ),
        method: 'POST',
      });
      if (!response.ok) {
        return rejectWithValue(
          generateSerilizadError({
            name: AuthTypeError.RefreshTokenFailed,
            message: response.statusText,
            status: response.status,
          })
        );
      }
      const data = camelcaseKeys(await response.json(), { deep: true });
      storeToken(data);

      return data;
    } catch (error) {
      if (error instanceof SyntaxError) {
        // Unexpected token < in JSON
        console.debug('There was a SyntaxError', error);
        throw new Error(String(error));
      }
      return rejectWithValue(
        generateSerilizadError({
          name: AuthTypeError.RefreshTokenFailed,
          message: 'Refresh token not present',
          status: 503,
        })
      );
    }
  }
);
