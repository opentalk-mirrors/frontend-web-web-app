// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import { WithLinkNotification, NotificationProps } from './WithLinkNotification';

vi.mock('react-i18next', () => ({
  Trans: ({
    i18nKey,
    components,
  }: {
    i18nKey: string;
    components: { messageLink: string; messageContainer: React.ReactElement };
  }) => (
    <div>
      {i18nKey} {components.messageLink} {components.messageContainer}
    </div>
  ),
}));

describe('WithLinkNotification', () => {
  it('renders notification with a link when URL is provided', () => {
    const props: NotificationProps = {
      translationKey: 'test.translation',
      url: 'https://example.com',
    };

    render(<WithLinkNotification {...props} />);

    const linkElement = screen.getByRole('link');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', 'https://example.com');
    expect(linkElement).toHaveAttribute('target', '_blank');
  });

  it('renders notification without a link when URL is not provided', () => {
    const props: NotificationProps = {
      translationKey: 'test.translation',
    };

    render(<WithLinkNotification {...props} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('test.translation')).toBeInTheDocument();
  });
});
