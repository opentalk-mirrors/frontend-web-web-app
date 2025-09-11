// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent } from '@testing-library/react';

import { MicOnIcon } from '../../../assets/icons';
import { renderWithProviders } from '../../../utils/testUtils';
import ToolbarButton from './ToolbarButton';

const handleClick = vi.fn();

describe('<ToolbarButton />', () => {
  const toolbarButtonProps = {
    hasContext: true,
    contextDisabled: false,
    contextTitle: 'toolbarToggleButton',
    tooltipTitle: 'toolbarMainButton',
    disabled: false,
    active: false,
    onClick: vi.fn(),
    openMenu: vi.fn(),
    isLobby: false,
  };

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders ToolbarButton with context and children', () => {
    renderWithProviders(
      <ToolbarButton {...toolbarButtonProps}>
        <MicOnIcon data-testid="toolbarChildrenTest" />
      </ToolbarButton>,
      { provider: { mui: true } }
    );

    expect(screen.getByRole('button', { name: 'toolbarMainButton' })).toBeInTheDocument();
    expect(screen.getByTestId('toolbarChildrenTest')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'toolbarToggleButton' })).toBeInTheDocument();
  });

  it('renders ToolbarButton without context', () => {
    renderWithProviders(
      <ToolbarButton {...toolbarButtonProps} hasContext={false}>
        <MicOnIcon data-testid="toolbarChildrenTest" />
      </ToolbarButton>,
      { provider: { mui: true } }
    );

    expect(screen.getByRole('button', { name: 'toolbarMainButton' })).toBeInTheDocument();
    expect(screen.getByTestId('toolbarChildrenTest')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'toolbarToggleButton' })).not.toBeInTheDocument();
  });

  it('handles click events on ToolbarButton', () => {
    renderWithProviders(
      <ToolbarButton {...toolbarButtonProps} onClick={handleClick}>
        <MicOnIcon data-testid="toolbarChildrenTest" />
      </ToolbarButton>,
      { provider: { mui: true } }
    );
    const button = screen.getByRole('button', { name: 'toolbarMainButton' });

    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger click events when ToolbarButton is disabled', () => {
    renderWithProviders(
      <ToolbarButton {...toolbarButtonProps} openMenu={handleClick} disabled>
        <MicOnIcon data-testid="toolbarChildrenTest" />
      </ToolbarButton>,
      { provider: { mui: true } }
    );
    const button = screen.getByRole('button', { name: 'toolbarMainButton' });

    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();

    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('handles click events on ToggleToolbarButton', () => {
    renderWithProviders(
      <ToolbarButton {...toolbarButtonProps} openMenu={handleClick}>
        <MicOnIcon data-testid="toolbarChildrenTest" />
      </ToolbarButton>,
      { provider: { mui: true } }
    );
    const toggleButton = screen.getByRole('button', { name: 'toolbarToggleButton' });
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
