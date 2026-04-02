// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

export type MessagePart =
  | { type: 'text'; offset: number; content: string }
  | { type: 'code'; offset: number; language: string; code: string };

/// regex matching code blocks: ```lang\n...code\n```
const CODE_FENCE_REGEX = /(```\w*\n[\s\S]*?```)/g;

// splits a chat message string into plain-text and code-block parts
export const parseMessageParts = (content: string): MessagePart[] => {
  const parts: MessagePart[] = [];
  let offset = 0;
  const rawParts = content.split(CODE_FENCE_REGEX);

  for (let i = 0; i < rawParts.length; i++) {
    const raw = rawParts[i];
    const currentOffset = offset;
    offset += raw.length;

    if (!raw) {
      continue;
    }

    // uneven indices are the capturing-group matches (code fences)
    // even indices are plain text between matches (or the whole string if no match)
    if (i % 2 === 1) {
      const newlineIndex = raw.indexOf('\n');
      const language = raw.slice(3, newlineIndex).trim() || 'text';
      const code = raw.slice(newlineIndex + 1, -3).replace(/\n$/, '');
      parts.push({ type: 'code', offset: currentOffset, language, code });
    } else {
      parts.push({ type: 'text', offset: currentOffset, content: raw });
    }
  }

  return parts;
};
