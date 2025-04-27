// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { joinUrls } from '../utils';
import { extractRelations, toCursorPaginated, toPagePaginated } from '../utils/extractLinkHeaders';

const payload = [{ foo: 'bar' }];
describe('extractLinkHeader', () => {
  it('should extract the correct page links', () => {
    const headers = new Headers({
      Link: '<http://example.com/items?page=1&per_age=30>; rel="first",<http://example.com/items?page=3&per_age=30>; rel="next", <http://example.com/items?page=3&per_age=30>; rel="last"',
    });
    const paged = toPagePaginated(headers, payload);
    expect(paged).toEqual({
      first: 1,
      next: 3,
      last: 3,
      data: payload,
    });
  });
  it('should extract the correct cursor links', () => {
    const headers = new Headers({ Link: '<http://example.com/feed?after=XYZ&per_age=30>; rel="after"' });
    const paged = toCursorPaginated(headers, payload);
    expect(paged).toEqual({
      after: 'XYZ',
      data: payload,
    });
  });
});

describe('extractRelations', () => {
  it('should extract all relation links from header', () => {
    const headers = new Headers({
      Link: '<http://example.com/items?page=1&per_age=30>; rel="first", <http://example.com/items?page=3&per_page=30>; rel="next", <http://example.com/items?page=3&per_age=30>; rel="last", <http://example.com/foo>; foo="foo"',
    });
    const relations = extractRelations(headers);
    expect(relations).toHaveProperty('first');
    expect(relations).toHaveProperty('next');
    expect(relations).toHaveProperty('last');
    expect(relations).not.toHaveProperty('foo');
  });
});

describe('joinUrls', () => {
  it('correctly joins constiations of relative urls', () => {
    expect(joinUrls('/api/', '/banana')).toBe('/api/banana');
    expect(joinUrls('/api/', 'banana')).toBe('/api/banana');

    expect(joinUrls('/api', 'banana')).toBe('/api/banana');
    expect(joinUrls('/api', '/banana/')).toBe('/api/banana/');

    expect(joinUrls('', '/banana')).toBe('/banana');
    expect(joinUrls('', 'banana')).toBe('banana');

    expect(joinUrls(undefined, 'banana')).toBe('banana');
    expect(joinUrls('/api/', undefined)).toBe('/api/');
  });

  it('correctly joins constiations of absolute urls', () => {
    expect(joinUrls('https://example.com/api', 'banana')).toBe('https://example.com/api/banana');
    expect(joinUrls('https://example.com/api', '/banana')).toBe('https://example.com/api/banana');

    expect(joinUrls('https://example.com/api/', 'banana')).toBe('https://example.com/api/banana');
    expect(joinUrls('https://example.com/api/', '/banana/')).toBe('https://example.com/api/banana/');
  });

  it('return empty string fro empty input', () => {
    expect(joinUrls(undefined, undefined)).toBe('');
    expect(joinUrls('', '')).toBe('');
  });
});
