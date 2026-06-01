// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

/**
 * Page based pagination parameters.
 */
export interface PagedPaginationParams {
  /**
   * Results per page (max 100)
   * @default 30
   */
  perPage?: number;
  /**
   * Page to fetch
   * @default 1
   */
  page?: number;
}

type AfterCursor = {
  /**
   * Page after cursor. Opaque string. Use response from last request.
   */
  after?: string;
};

type BeforeCursor = {
  /**
   * Page before cursor. Opaque string. Use response from last request.
   */
  before?: string;
};

type Cursors = AfterCursor & BeforeCursor;

/**
 * Cursor based pagination parameters.
 *
 * In the default version only the after cursor is support.
 * If an endpoint needs the before cursor or both you need to specify the T generic bound explicitly.
 */
export type CursorPaginationParams<T extends Cursors = Cursors> = {
  /**
   * Results per Page (max 100)
   * @default 30
   */
  perPage?: number;
} & T;
