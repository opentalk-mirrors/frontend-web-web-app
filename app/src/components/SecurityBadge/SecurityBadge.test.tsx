// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ParticipationKind } from '../../types';
import { renderWithProviders, mockStore } from '../../utils/testUtils';
import SecurityBadge from './SecurityBadge';

const NUMBER_OF_PARTICIPANTS = 2;
describe('<SecurityBadge />', () => {
  test('should open popover on button click', () => {
    const { store } = mockStore(NUMBER_OF_PARTICIPANTS, {});
    renderWithProviders(<SecurityBadge />, { store });

    const button = screen.getByRole('button', { name: 'secure-connection-button-label' });
    expect(screen.queryByText('secure-connection-title')).not.toBeInTheDocument();

    act(() => {
      button.click();
    });

    const popoverTitle = screen.getByRole('heading', { name: 'secure-connection-title' });
    expect(popoverTitle).toBeInTheDocument();
  });
  test('should close popover if its opened and button is clicked again', () => {
    const { store } = mockStore(NUMBER_OF_PARTICIPANTS, {});
    renderWithProviders(<SecurityBadge />, { store });
    const button = screen.getByRole('button', { name: 'secure-connection-button-label' });

    act(() => {
      button.click();
    });

    expect(screen.getByRole('heading', { name: 'secure-connection-title' })).toBeInTheDocument();

    act(() => {
      button.click();
    });

    const popoverTitle = screen.queryByRole('heading', { name: 'secure-connection-title' });
    expect(popoverTitle).not.toBeInTheDocument();
  });
  test('should open popover if button is focused and "Enter" pressed', async () => {
    const { store } = mockStore(NUMBER_OF_PARTICIPANTS, {});
    renderWithProviders(<SecurityBadge />, { store });

    const button = screen.getByRole('button', { name: 'secure-connection-button-label' });
    expect(screen.queryByText('secure-connection-title')).not.toBeInTheDocument();

    await userEvent.tab();

    expect(button).toHaveFocus();

    await userEvent.keyboard('[Enter]');

    const popoverTitle = screen.getByRole('heading', { name: 'secure-connection-title' });
    expect(popoverTitle).toBeInTheDocument();
  });
  test('should open popover if button is focused and "Space" pressed', async () => {
    const { store } = mockStore(NUMBER_OF_PARTICIPANTS, {});
    renderWithProviders(<SecurityBadge />, { store });

    const button = screen.getByRole('button', { name: 'secure-connection-button-label' });
    expect(screen.queryByText('secure-connection-title')).not.toBeInTheDocument();

    await userEvent.tab();

    expect(button).toHaveFocus();

    await userEvent.keyboard('[Space]');

    const popoverTitle = screen.getByRole('heading', { name: 'secure-connection-title' });
    expect(popoverTitle).toBeInTheDocument();
  });
  test('should close popover if its opened and "Escape" pressed', async () => {
    const { store } = mockStore(NUMBER_OF_PARTICIPANTS, {});
    renderWithProviders(<SecurityBadge />, { store });

    const button = screen.getByRole('button', { name: 'secure-connection-button-label' });
    expect(screen.queryByText('secure-connection-title')).not.toBeInTheDocument();

    await userEvent.tab();

    expect(button).toHaveFocus();

    await userEvent.keyboard('[Enter]');

    const popoverTitle = screen.getByRole('heading', { name: 'secure-connection-title' });
    expect(popoverTitle).toBeInTheDocument();

    await userEvent.keyboard('[Escape]');

    expect(popoverTitle).not.toBeInTheDocument();
  });
  test('should show the guest participant popover message when a guest is present', async () => {
    const { store } = mockStore(NUMBER_OF_PARTICIPANTS, { participantKinds: [ParticipationKind.Guest] });
    renderWithProviders(<SecurityBadge />, { store });

    const button = screen.getByRole('button', { name: 'secure-connection-button-label' });
    expect(screen.queryByText('secure-connection-title')).not.toBeInTheDocument();

    await userEvent.click(button);

    expect(screen.getByText('secure-connection-guests')).toBeInTheDocument();

    await userEvent.click(button);

    expect(screen.queryByText('secure-connection-guests')).not.toBeInTheDocument();
  });
  test('should show the sip participant popover message when a sip user is present', async () => {
    const { store } = mockStore(NUMBER_OF_PARTICIPANTS, { participantKinds: [ParticipationKind.Sip] });
    renderWithProviders(<SecurityBadge />, { store });

    const button = screen.getByRole('button', { name: 'secure-connection-button-label' });
    expect(screen.queryByText('secure-connection-title')).not.toBeInTheDocument();

    await userEvent.click(button);

    expect(screen.getByText('secure-connection-sip')).toBeInTheDocument();
    expect(screen.queryByText('secure-connection-guests')).not.toBeInTheDocument();

    await userEvent.click(button);

    expect(screen.queryByText('secure-connection-sip')).not.toBeInTheDocument();
  });
  test('should show the mixed popover message when a sip user and a guest user is present', async () => {
    const { store } = mockStore(NUMBER_OF_PARTICIPANTS, {
      participantKinds: [ParticipationKind.Sip, ParticipationKind.Guest],
    });
    renderWithProviders(<SecurityBadge />, { store });

    const button = screen.getByRole('button', { name: 'secure-connection-button-label' });
    expect(screen.queryByText('secure-connection-title')).not.toBeInTheDocument();

    await userEvent.click(button);

    expect(screen.getByText('secure-connection-contaminated')).toBeInTheDocument();
    expect(screen.queryByText('secure-connection-guests')).not.toBeInTheDocument();
    expect(screen.queryByText('secure-connection-sip')).not.toBeInTheDocument();

    await userEvent.click(button);

    expect(screen.queryByText('secure-connection-contaminated')).not.toBeInTheDocument();
  });
});
