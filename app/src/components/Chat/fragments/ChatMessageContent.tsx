// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, useTheme } from '@mui/material';
import Linkify from 'linkify-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { CopyIcon, DoneIcon } from '../../../assets/icons';
import { IconButton } from '../../../commonComponents';
import { parseMessageParts, type MessagePart } from './parseMessageParts';

const MarkdownLink = styled('a')(({ theme }) => ({
  color: theme.palette.secondary.main,
}));

const LINKIFY_OPTIONS = {
  render: ({ attributes, content }: { attributes: Record<string, string>; content: string }) => (
    <MarkdownLink {...attributes} target="_blank" rel="noopener noreferrer">
      {content}
    </MarkdownLink>
  ),
};

// extends the code block to fill the full chat message width
const CodePreBlock = styled('pre', {
  shouldForwardProp: (prop) => prop !== 'ownMessage',
})<{ ownMessage?: boolean }>(({ theme, ownMessage }) => {
  const offset = `calc(2.25rem + ${theme.spacing(1)})`;
  return {
    overflow: 'auto',
    borderRadius: theme.shape.borderRadius,
    marginBlock: theme.spacing(0.5),
    marginLeft: ownMessage ? 0 : `calc(-1 * ${offset})`,
    marginRight: ownMessage ? `calc(-1 * ${offset})` : 0,
    width: `calc(100% + ${offset})`,
  };
});

const CodeBlockContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  marginBlock: theme.spacing(0.5),
}));

const CopyButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(0.25),
  right: theme.spacing(0.25),
}));

// matches ```language\ncode``` blocks, capturing the language and code separately

const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const theme = useTheme();

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <CodeBlockContainer>
      {code.length > 0 && (
        <CopyButton aria-label={copied ? t('global-copied') : t('global-copy')} onClick={handleCopy}>
          {copied ? <DoneIcon /> : <CopyIcon />}
        </CopyButton>
      )}
      <SyntaxHighlighter language={language} style={theme.palette.mode === 'light' ? oneLight : oneDark} PreTag="div">
        {code}
      </SyntaxHighlighter>
    </CodeBlockContainer>
  );
};

interface ChatMessageContentProps {
  content: string;
  ownMessage: boolean;
}

const ChatMessageContent = ({ content, ownMessage }: ChatMessageContentProps) => {
  return parseMessageParts(content).map((part: MessagePart) => {
    if (part.type === 'code') {
      return (
        <CodePreBlock key={part.offset} ownMessage={ownMessage}>
          <CodeBlock language={part.language} code={part.code} />
        </CodePreBlock>
      );
    }

    return (
      <Linkify key={part.offset} tagName="span" options={LINKIFY_OPTIONS}>
        {part.content}
      </Linkify>
    );
  });
};

export default ChatMessageContent;
