// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { render, screen, act } from '../../utils/testUtils';
import PopoverButton from './PopoverButton';

describe('<PopoverButton />', () => {
  const icon = <span>Icon</span>;
  const content = <div>Popover Content</div>;
  const buttonLabel = 'popover-button-label';
  const titleLabel = 'popover-title';
  const popoverTitleId = 'popover-title-id';

  it('should render the button with provided icon and label', async () => {
    await render(
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
    await render(
      <PopoverButton
        icon={icon}
        content={content}
        buttonLabel={buttonLabel}
        titleLabel={titleLabel}
        popoverTitleId={popoverTitleId}
      />
    );

    const button = screen.getByRole('button', { name: buttonLabel });
    await act(async () => {
      await userEvent.click(button);
    });

    expect(screen.getByText('Popover Content')).toBeInTheDocument();
  });

  it('should close the popover when button is clicked again', async () => {
    await render(
      <PopoverButton
        icon={icon}
        content={content}
        buttonLabel={buttonLabel}
        titleLabel={titleLabel}
        popoverTitleId={popoverTitleId}
      />
    );

    const button = screen.getByRole('button', { name: buttonLabel });
    await act(async () => {
      await userEvent.click(button);
    });

    expect(screen.getByText('Popover Content')).toBeInTheDocument();

    await act(async () => {
      await userEvent.click(button);
    });

    await waitFor(() => {
      expect(screen.queryByText('Popover Content')).not.toBeInTheDocument();
    });
  });

  it('should open the popover when "Enter" key is pressed on the button', async () => {
    await render(
      <PopoverButton
        icon={icon}
        content={content}
        buttonLabel={buttonLabel}
        titleLabel={titleLabel}
        popoverTitleId={popoverTitleId}
      />
    );

    const button = screen.getByRole('button', { name: buttonLabel });
    await act(async () => {
      await userEvent.tab(); // Focus the button
    });

    expect(button).toHaveFocus();

    await act(async () => {
      await userEvent.keyboard('[Enter]');
    });

    expect(screen.getByText('Popover Content')).toBeInTheDocument();
  });

  it('should open the popover when "Space" key is pressed on the button', async () => {
    await render(
      <PopoverButton
        icon={icon}
        content={content}
        buttonLabel={buttonLabel}
        titleLabel={titleLabel}
        popoverTitleId={popoverTitleId}
      />
    );

    const button = screen.getByRole('button', { name: buttonLabel });
    await act(async () => {
      await userEvent.tab(); // Focus the button
    });

    expect(button).toHaveFocus();

    await act(async () => {
      await userEvent.keyboard('[Space]');
    });

    expect(screen.getByText('Popover Content')).toBeInTheDocument();
  });

  it('should close the popover when "Escape" key is pressed', async () => {
    await render(
      <PopoverButton
        icon={icon}
        content={content}
        buttonLabel={buttonLabel}
        titleLabel={titleLabel}
        popoverTitleId={popoverTitleId}
      />
    );

    const button = screen.getByRole('button', { name: buttonLabel });
    await act(async () => {
      await userEvent.click(button);
    });

    expect(screen.getByText('Popover Content')).toBeInTheDocument();

    await act(async () => {
      await userEvent.keyboard('[Escape]');
    });

    await waitFor(() => {
      expect(screen.queryByText('Popover Content')).not.toBeInTheDocument();
    });
  });

  it('should render the title with the provided titleLabel and popoverTitleId', async () => {
    await render(
      <PopoverButton
        icon={icon}
        content={content}
        buttonLabel={buttonLabel}
        titleLabel={titleLabel}
        popoverTitleId={popoverTitleId}
      />
    );

    const button = screen.getByRole('button', { name: buttonLabel });
    await act(async () => {
      await userEvent.click(button);
    });

    const title = screen.getByRole('heading', { name: titleLabel });
    expect(title).toBeInTheDocument();
    expect(title).toHaveAttribute('id', popoverTitleId);
  });
});
