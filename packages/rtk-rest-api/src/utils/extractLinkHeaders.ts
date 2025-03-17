// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { CursorPaginated, PagePaginated } from '../types/common';

type Link = { url: string; rel: string; [queryParam: string]: string };
export type Relations = Record<string, Link>;

const parseLinkInternal = (link: string, baseUrl?: string): Record<string, string> | null => {
  try {
    // Matches "<URL> extra"
    // E.g. '<https://google.de> rel="value"' -> ('https://google.de', 'rel="value"')
    const match = link.match(/<?([^>]*)>(.*)/);
    if (match) {
      const linkUrl = match[1];
      const parts = match[2].split(';');
      // Fallback to window.location.href here when no baseUrl is given
      const parsedUrl = new URL(linkUrl, baseUrl || window.location.href);
      const query = Object.fromEntries(parsedUrl.searchParams);

      let info = { url: linkUrl };
      const attributes = parts.reduce((acc: Record<string, string>, part: string) => {
        // Matches `attrName = attrValue` and `attrName = "attrValue"`
        const match = part.match(/\s*(.+)\s*=\s*"?([^"]+)"?/);
        if (match) {
          const attribName = match[1];
          const attribValue = match[2];
          acc[attribName] = attribValue;
          return acc;
        } else {
          return acc;
        }
      }, {});
      info = { ...query, ...info, ...attributes };

      return info;
    }
    return null;
  } catch (e) {
    console.error('parseLinkInternal', e);
    return null;
  }
};

const intoRels = (acc: Record<string, Link>, link: Link) => {
  // Split by more or equal than one space
  link.rel.split(/\s+/).forEach((rel) => {
    acc[rel] = { ...link, ...{ rel: rel } };
  });

  return acc;
};

const isLink = (x: Record<string, string | URL> | null | undefined): x is Link => {
  return !!x && 'rel' in x && 'url' in x;
};

/**
 * Parses a link header and returns a structured object for all Links with a rel attribute.
 *
 * This does not support all features of rfc8288, e.g registered relations as well as
 * different encodings are not supported as of now.
 * There is no browser focused library on NPM that handles these cases
 *
 * @param {string|null} linkHeader the Link header value
 * @returns Object with relation -> Link mapping
 */
export const parseLink = (linkHeader: string | null, baseUrl?: string): Record<string, Link> | null => {
  if (!linkHeader) {
    return null;
  }
  if (linkHeader.length > 2000) {
    return null;
  }

  return linkHeader
    .split(/,\s*</)
    .map((x) => parseLinkInternal(x, baseUrl))
    .filter<Link>(isLink)
    .reduce(intoRels, {});
};

/**
 * Extracts the relations present in the Link header
 *
 * @param {Headers} headers dom headers object from fetch
 * @returns {Object} relations contained in the Link header
 */
export const extractRelations = (headers: Headers): Relations => {
  let relations: Relations = {};
  if (headers.has('Link')) {
    relations = parseLink(headers.get('Link')) || {};
  }
  return relations;
};

/**
 * Builds the CursorPaginated object based on the headers and given payload
 *
 * @param {Headers} headers dom object from the fetch response
 * @param {Object[]} payload from the fetch responseBody
 * @returns {Object} CursorPaginated response
 */
export const toCursorPaginated = <P>(headers: Headers | undefined, payload: Array<P>): CursorPaginated<P> => {
  const paginated: CursorPaginated<P> = { data: payload };
  if (headers === undefined) {
    return paginated;
  }
  const relations = extractRelations(headers);

  paginated.after = relations?.after?.after;
  paginated.before = relations?.before?.before;

  return paginated;
};

const parseIntOr = (numberString: string | undefined, orDefault: number | undefined) => {
  if (numberString) {
    return parseInt(numberString) || orDefault;
  } else {
    return orDefault;
  }
};

/**
 * Builds the PagePaginated object based on the headers and given payload
 *
 * @param {Headers} headers dom object from the fetch response
 * @param {Object[]} payload from the fetch responseBody
 * @returns {Object} PagePaginated response
 */
export const toPagePaginated = <P>(headers: Headers | undefined, payload: Array<P>): PagePaginated<P> => {
  const paginated: PagePaginated<P> = { data: payload };
  if (headers === undefined) {
    return paginated;
  }
  const relations = extractRelations(headers);

  paginated.first = parseIntOr(relations?.first?.page, undefined);
  paginated.prev = parseIntOr(relations?.prev?.page, undefined);
  paginated.next = parseIntOr(relations?.next?.page, undefined);
  paginated.last = parseIntOr(relations?.last?.page, undefined);

  return paginated;
};
