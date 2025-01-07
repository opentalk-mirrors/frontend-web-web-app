// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MicOnIcon } from '../../../assets/icons';
import { render, screen, cleanup, fireEvent } from '../../../utils/testUtils';
import ToolbarButton from './ToolbarButton';

const handleClick = jest.fn();

describe('<ToolbarButton />', () => {
  afterEach(() => cleanup());

  const toolbarButtonProps = {
    hasContext: true,
    contextDisabled: false,
    contextTitle: 'toolbarToggleButton',
    tooltipTitle: 'toolbarMainButton',
    disabled: false,
    active: false,
    onClick: jest.fn(),
    openMenu: jest.fn(),
    isLobby: false,
  };

  test('render ToolbarButton with context and children', async () => {
    await render(
      <ToolbarButton {...toolbarButtonProps}>
        <MicOnIcon data-testid="toolbarChildrenTest" />
      </ToolbarButton>
    );
    expect(screen.getByRole('button', { name: 'toolbarMainButton' })).toBeInTheDocument();
    expect(screen.getByTestId('toolbarChildrenTest')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'toolbarToggleButton' })).toBeInTheDocument();
  });

  test('render ToolbarButton without context', async () => {
    await render(
      <ToolbarButton {...toolbarButtonProps} hasContext={false}>
        <MicOnIcon data-testid="toolbarChildrenTest" />
      </ToolbarButton>
    );
    expect(screen.getByRole('button', { name: 'toolbarMainButton' })).toBeInTheDocument();
    expect(screen.getByTestId('toolbarChildrenTest')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'toolbarToggleButton' })).not.toBeInTheDocument();
  });

  test('testing click on ToolbarButton', async () => {
    await render(
      <ToolbarButton {...toolbarButtonProps} onClick={handleClick}>
        <MicOnIcon data-testid="toolbarChildrenTest" />
      </ToolbarButton>
    );
    const button = screen.getByRole('button', { name: 'toolbarMainButton' });

    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('testing click on disabled ToolbarButton', async () => {
    await render(
      <ToolbarButton {...toolbarButtonProps} openMenu={handleClick} disabled>
        <MicOnIcon data-testid="toolbarChildrenTest" />
      </ToolbarButton>
    );
    const button = screen.getByRole('button', { name: 'toolbarMainButton' });

    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('testing click on ToggleToolbarButton', async () => {
    await render(
      <ToolbarButton {...toolbarButtonProps} openMenu={handleClick}>
        <MicOnIcon data-testid="toolbarChildrenTest" />
      </ToolbarButton>
    );
    const toggleButton = screen.getByRole('button', { name: 'toolbarToggleButton' });
    expect(toggleButton).toBeInTheDocument();
    fireEvent.click(toggleButton);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
