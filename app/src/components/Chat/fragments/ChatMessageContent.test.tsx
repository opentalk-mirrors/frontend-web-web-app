// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import { renderWithProviders } from '../../../utils/testUtils';
import ChatMessageContent from './ChatMessageContent';

const render = (content: string, ownMessage = false) =>
  renderWithProviders(<ChatMessageContent content={content} ownMessage={ownMessage} />, { provider: { mui: true } });

describe('ChatMessageContent', () => {
  it('renders plain text', () => {
    render('hello world');

    expect(screen.getByText('hello world')).toBeInTheDocument();
  });

  it('renders a URL as a link with the correct attributes', () => {
    render('visit https://example.com please');

    const link = screen.getByRole('link', { name: 'https://example.com' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders a copy button for non-empty code blocks', () => {
    render('```ts\nconst x = 1;\n```');

    expect(screen.getByRole('button', { name: 'global-copy' })).toBeInTheDocument();
  });

  it('does not render a copy button for an empty code block', () => {
    render('```ts\n\n```');

    expect(screen.queryByRole('button', { name: 'global-copy' })).not.toBeInTheDocument();
  });

  it('copies code to clipboard and shows confirmation when copy button is clicked', async () => {
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

    render('```ts\nconst x = 1;\n```');
    fireEvent.click(screen.getByRole('button', { name: 'global-copy' }));

    expect(writeText).toHaveBeenCalledWith('const x = 1;');
    expect(await screen.findByRole('button', { name: 'global-copied' })).toBeInTheDocument();
  });

  it('renders both text and code when mixed content is provided', () => {
    render('Check this:\n```ts\nconst x = 1;\n```\nDone.');

    expect(screen.getByText(/Check this:/)).toBeInTheDocument();
    expect(screen.getByText(/Done\./)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'global-copy' })).toBeInTheDocument();
  });
});
