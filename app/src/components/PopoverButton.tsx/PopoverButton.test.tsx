// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { waitFor, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PopoverButton from './PopoverButton';

describe('<PopoverButton />', () => {
  const icon = <span>Icon</span>;
  const content = <div>Popover Content</div>;
  const buttonLabel = 'popover-button-label';
  const titleLabel = 'popover-title';
  const popoverTitleId = 'popover-title-id';

  it('should render the button with provided icon and label', () => {
    render(
      <PopoverButton
        icon={icon}
        content={content}
        buttonLabel={buttonLabel}
        titleLabel={titleLabel}
        popoverTitleId={popoverTitleId}
      />
    );

    const button = screen.getByRole('button', { name: buttonLabel });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Icon');
  });

  it('should open the popover when button is clicked', async () => {
    render(
      <PopoverButton
        icon={icon}
        content={content}
        buttonLabel={buttonLabel}
        titleLabel={titleLabel}
        popoverTitleId={popoverTitleId}
      />
    );

    const button = screen.getByRole('button', { name: buttonLabel });

    await userEvent.click(button);

    expect(screen.getByText('Popover Content')).toBeInTheDocument();
  });

  it('should close the popover when button is clicked again', async () => {
    render(
      <PopoverButton
        icon={icon}
        content={content}
        buttonLabel={buttonLabel}
        titleLabel={titleLabel}
        popoverTitleId={popoverTitleId}
      />
    );

    const button = screen.getByRole('button', { name: buttonLabel });

    await userEvent.click(button);

    expect(screen.getByText('Popover Content')).toBeInTheDocument();

    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.queryByText('Popover Content')).not.toBeInTheDocument();
    });
  });

  it('should open the popover when "Enter" key is pressed on the button', async () => {
    render(
      <PopoverButton
        icon={icon}
        content={content}
        buttonLabel={buttonLabel}
        titleLabel={titleLabel}
        popoverTitleId={popoverTitleId}
      />
    );

    const button = screen.getByRole('button', { name: buttonLabel });

    await userEvent.tab(); // Focus the button

    await waitFor(() => {
      expect(button).toHaveFocus();
    });

    await userEvent.keyboard('[Enter]');

    await waitFor(() => {
      expect(screen.getByText('Popover Content')).toBeInTheDocument();
    });
  });

  it('should open the popover when "Space" key is pressed on the button', async () => {
    render(
      <PopoverButton
        icon={icon}
        content={content}
        buttonLabel={buttonLabel}
        titleLabel={titleLabel}
        popoverTitleId={popoverTitleId}
      />
    );

    const button = screen.getByRole('button', { name: buttonLabel });

    await userEvent.tab(); // Focus the button

    await waitFor(() => {
      expect(button).toHaveFocus();
    });

    await userEvent.keyboard('[Space]');

    await waitFor(() => {
      expect(screen.getByText('Popover Content')).toBeInTheDocument();
    });
  });

  it('should close the popover when "Escape" key is pressed', async () => {
    render(
      <PopoverButton
        icon={icon}
        content={content}
        buttonLabel={buttonLabel}
        titleLabel={titleLabel}
        popoverTitleId={popoverTitleId}
      />
    );

    const button = screen.getByRole('button', { name: buttonLabel });

    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Popover Content')).toBeInTheDocument();
    });

    await userEvent.keyboard('[Escape]');

    await waitFor(() => {
      expect(screen.queryByText('Popover Content')).not.toBeInTheDocument();
    });
  });

  it('should render the title with the provided titleLabel and popoverTitleId', async () => {
    render(
      <PopoverButton
        icon={icon}
        content={content}
        buttonLabel={buttonLabel}
        titleLabel={titleLabel}
        popoverTitleId={popoverTitleId}
      />
    );

    const button = screen.getByRole('button', { name: buttonLabel });

    await userEvent.click(button);

    const title = screen.getByRole('heading', { name: titleLabel });
    await waitFor(() => {
      expect(title).toBeInTheDocument();
    });
    expect(title).toHaveAttribute('id', popoverTitleId);
  });
});
