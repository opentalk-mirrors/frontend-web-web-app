// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { isPlainObject } from '@reduxjs/toolkit';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta, BaseQueryApi } from '@reduxjs/toolkit/query';
import snakecaseKeys from 'snakecase-keys';

import { camelcaseKeysDeep } from './types/utils';
import { joinUrls } from './utils';

type ResponseHandler = 'content-type' | 'json' | 'text' | ((response: Response) => Promise<unknown>);

const defaultFetchFn: typeof fetch = (input, init) => fetch(input, init);

const defaultValidateStatus = (response: Response) => response.status >= 200 && response.status <= 299;

const isJsonContentType = (headers: Headers) => headers.get('content-type')?.trim()?.startsWith('application/json');
function isRecord(obj: unknown): obj is Record<string | number | symbol, unknown> {
  return isPlainObject(obj);
}

export function stripUndefinedHeaderValues(
  obj: Headers | string[][] | Record<string, string | undefined>
): HeadersInit | undefined {
  if (obj === undefined || obj instanceof Headers) {
    return obj;
  }

  if (isRecord(obj)) {
    return stripUndefinedRecordValues(obj);
  }

  const result: Array<[string, string]> = obj
    .filter((a) => a.length === 2 && a[1] !== undefined)
    .map((a) => a as [string, string]);
  return result;
}

function stripUndefinedRecordValues(obj: Record<string, string | undefined>): Record<string, string> {
  const copy: Record<string, string | undefined> = { ...obj };
  for (const [k, v] of Object.entries(copy)) {
    if (typeof v === 'undefined') {
      delete copy[k];
    }
  }
  return copy as Record<string, string>;
}
export type FetchBaseQueryArgs = {
  baseUrl?:
    | string
    | ((
        api: Pick<BaseQueryApi, 'getState' | 'extra' | 'endpoint' | 'type' | 'forced'>
      ) => string | PromiseLike<string>);
  prepareHeaders?: (
    headers: Headers,
    api: Pick<BaseQueryApi, 'getState' | 'extra' | 'endpoint' | 'type' | 'forced'>
  ) => Headers | PromiseLike<Headers>;
  transformJsonResponse?: (response: ReturnType<typeof JSON.parse>) => unknown;
  fetchFn?: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;

  paramsSerializer?: (params: Record<string, unknown>) => string;
} & RequestInit;

/**
 * This is a modified version of the fetchBaseQuery of rtk-query, with the following changes:
 *
 * * allows you to pass a function to baseUrl similar to prepareHeaders
 * * allows you to specify a default transformResponse for json, which will called by default. Per default this is a to camelCase conversion of keys
 * * the paramsSerializer will snake_case all keys
 */
function fetchQuery({
  baseUrl,
  prepareHeaders = (x) => x,
  transformJsonResponse = camelcaseKeysDeep,
  fetchFn = defaultFetchFn,
  paramsSerializer,
  ...baseFetchOptions
}: FetchBaseQueryArgs = {}): BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  unknown,
  FetchBaseQueryMeta
> {
  const handleResponse = async (response: Response, responseHandler: ResponseHandler): Promise<unknown> => {
    if (typeof responseHandler === 'function') {
      return responseHandler(response);
    }

    if (responseHandler === 'text') {
      return response.text();
    }

    if (responseHandler === 'json') {
      const text = await response.text();
      return text.length ? transformJsonResponse(JSON.parse(text)) : null;
    }
  };

  return async (arg, api) => {
    const { signal, getState, extra, endpoint, forced, type } = api;

    // Split into two to have const and let destructuring assignments
    const argObject = typeof arg == 'string' ? { url: arg } : arg;
    const {
      method = 'GET' as const,
      headers = new Headers({}),
      body = undefined,
      params = undefined,
      responseHandler = 'json' as const,
      validateStatus = defaultValidateStatus,
      ...rest
    } = argObject;
    let { url } = argObject;

    const config: RequestInit = {
      ...baseFetchOptions,
      method,
      signal,
      body,
      ...rest,
    };

    config.headers = await prepareHeaders(new Headers(stripUndefinedHeaderValues(headers)), {
      getState,
      extra,
      endpoint,
      forced,
      type,
    });

    // Only set the content-type to json if appropriate. Will not be true for FormData, ArrayBuffer, Blob, etc.
    const isJsonifiable = (body: unknown) =>
      typeof body === 'object' &&
      (isPlainObject(body) || Array.isArray(body) || (body !== null && typeof body['toJSON'] === 'function'));

    if (!config.headers.has('content-type') && isJsonifiable(body)) {
      config.headers.set('content-type', 'application/json');
    }

    if (body && isJsonContentType(config.headers)) {
      config.body = JSON.stringify(body);
    }

    if (params !== undefined && Object.keys(params).length > 0) {
      const divider = ~url.indexOf('?') ? '&' : '?';
      const query = paramsSerializer
        ? paramsSerializer(params)
        : new URLSearchParams(snakecaseKeys(stripUndefinedRecordValues(params)));

      url += divider + query;
    }

    if (typeof baseUrl === 'function') {
      url = joinUrls(await baseUrl({ getState, extra, endpoint, forced, type }), url);
    } else {
      url = joinUrls(baseUrl, url);
    }

    const request = new Request(url, config);
    const requestClone = request.clone();
    const meta: FetchBaseQueryMeta = { request: requestClone };

    let response;
    try {
      response = await fetchFn(request);
    } catch (e) {
      return { error: { status: 'FETCH_ERROR', error: String(e) }, meta };
    }
    const responseClone = response.clone();

    meta.response = responseClone;

    let resultData: unknown;
    let responseText = '';
    try {
      let handleResponseError;
      await Promise.all([
        handleResponse(response, responseHandler).then(
          (r) => (resultData = r),
          (e) => (handleResponseError = e)
        ),
        //FIXME: See if we can remove this as we probably do not need to support node-fetch.
        // The next Nodejs version does support fetch natively, we should check if this is the
        // case with the native fetch as well
        //
        // see https://github.com/node-fetch/node-fetch/issues/665#issuecomment-538995182
        // we *have* to "use up" both streams at the same time or they will stop running in node-fetch scenarios
        responseClone.text().then(
          (r) => (responseText = r),
          () => {
            // We need to ignore this rejection here, so Promise.all will not exit on a rejected response in the cloned response
          }
        ),
      ]);
      if (handleResponseError) {
        throw handleResponseError;
      }
    } catch (e) {
      return {
        error: {
          status: 'PARSING_ERROR',
          originalStatus: response.status,
          data: responseText,
          error: String(e),
        },
        meta,
      };
    }

    return validateStatus(response, resultData)
      ? {
          data: resultData,
          meta,
        }
      : {
          error: {
            status: response.status,
            data: resultData,
          },
          meta,
        };
  };
}

export default fetchQuery;
