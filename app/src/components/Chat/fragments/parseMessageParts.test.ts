// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { parseMessageParts } from './parseMessageParts';

describe('parseMessageParts', () => {
  it('returns a single text part for plain text', () => {
    const parts = parseMessageParts('hello world');

    expect(parts).toHaveLength(1);
    expect(parts[0]).toMatchObject({ type: 'text', content: 'hello world' });
  });

  it('returns a code part for a properly closed code fence', () => {
    const parts = parseMessageParts('```ts\nconst x = 1;\n```');

    expect(parts).toHaveLength(1);
    expect(parts[0]).toMatchObject({ type: 'code', language: 'ts', code: 'const x = 1;' });
  });

  it('defaults language to "text" when the fence has no language tag', () => {
    const parts = parseMessageParts('```\nsome code\n```');

    expect(parts).toHaveLength(1);
    expect(parts[0]).toMatchObject({ type: 'code', language: 'text', code: 'some code' });
  });

  it('returns all as plain text when the code fence is not closed', () => {
    const content = '```ts\nconst x = 1;';
    const parts = parseMessageParts(content);

    expect(parts).toHaveLength(1);
    expect(parts[0]).toMatchObject({ type: 'text', content });
  });

  it('handles mixed text and code parts', () => {
    const parts = parseMessageParts('before\n```ts\nconst x = 1;\n```\nafter');

    expect(parts).toHaveLength(3);
    expect(parts[0]).toMatchObject({ type: 'text', content: 'before\n' });
    expect(parts[1]).toMatchObject({ type: 'code', language: 'ts', code: 'const x = 1;' });
    expect(parts[2]).toMatchObject({ type: 'text', content: '\nafter' });
  });

  it('handles multiple code blocks in a single message', () => {
    const parts = parseMessageParts('```ts\nfoo\n```\ntext\n```js\nbar\n```');

    expect(parts).toHaveLength(3);
    expect(parts[0]).toMatchObject({ type: 'code', language: 'ts', code: 'foo' });
    expect(parts[1]).toMatchObject({ type: 'text', content: '\ntext\n' });
    expect(parts[2]).toMatchObject({ type: 'code', language: 'js', code: 'bar' });
  });

  it('returns an empty array for an empty string', () => {
    expect(parseMessageParts('')).toHaveLength(0);
  });
});
