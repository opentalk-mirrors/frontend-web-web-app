// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import userEvent from '@testing-library/user-event';

import { ParticipationKind } from '../../types';
import { screen, render, mockStore, act } from '../../utils/testUtils';
import SecurityBadge from './SecurityBadge';

const NUMBER_OF_PARTICIPANTS = 2;
describe('<SecurityBadge />', () => {
  it('should open popover on button click', async () => {
    const { store } = mockStore(NUMBER_OF_PARTICIPANTS, {});
    await render(<SecurityBadge />, store);

    const button = screen.getByRole('button', { name: 'secure-connection-button-label' });
    expect(screen.queryByText('secure-connection-title')).not.toBeInTheDocument();

    await act(async () => {
      await userEvent.click(button);
    });

    const popoverTitle = screen.getByRole('heading', { name: 'secure-connection-title' });
    expect(popoverTitle).toBeInTheDocument();
  });
  it('should close popover if its opened and button is clicked again', async () => {
    const { store } = mockStore(NUMBER_OF_PARTICIPANTS, {});
    await render(<SecurityBadge />, store);

    const button = screen.getByRole('button', { name: 'secure-connection-button-label' });
    await act(async () => {
      await userEvent.click(button);
      await userEvent.click(button);
    });

    const popoverTitle = screen.queryByRole('heading', { name: 'secure-connection-title' });
    expect(popoverTitle).not.toBeInTheDocument();
  });
  it('should open popover if button is focused and "Enter" pressed', async () => {
    const { store } = mockStore(NUMBER_OF_PARTICIPANTS, {});
    await render(<SecurityBadge />, store);

    const button = screen.getByRole('button', { name: 'secure-connection-button-label' });
    expect(screen.queryByText('secure-connection-title')).not.toBeInTheDocument();

    await act(async () => {
      await userEvent.tab();
    });

    expect(button).toHaveFocus();

    await act(async () => {
      await userEvent.keyboard('[Enter]');
    });

    const popoverTitle = screen.getByRole('heading', { name: 'secure-connection-title' });
    expect(popoverTitle).toBeInTheDocument();
  });
  it('should open popover if button is focused and "Space" pressed', async () => {
    const { store } = mockStore(NUMBER_OF_PARTICIPANTS, {});
    await render(<SecurityBadge />, store);

    const button = screen.getByRole('button', { name: 'secure-connection-button-label' });
    expect(screen.queryByText('secure-connection-title')).not.toBeInTheDocument();

    await act(async () => {
      await userEvent.tab();
    });

    expect(button).toHaveFocus();

    await act(async () => {
      await userEvent.keyboard('[Space]');
    });

    const popoverTitle = screen.getByRole('heading', { name: 'secure-connection-title' });
    expect(popoverTitle).toBeInTheDocument();
  });
  it('should close popover if its opened and "Escape" pressed', async () => {
    const { store } = mockStore(NUMBER_OF_PARTICIPANTS, {});
    await render(<SecurityBadge />, store);

    const button = screen.getByRole('button', { name: 'secure-connection-button-label' });
    expect(screen.queryByText('secure-connection-title')).not.toBeInTheDocument();

    await act(async () => {
      await userEvent.tab();
    });

    expect(button).toHaveFocus();

    await act(async () => {
      await userEvent.keyboard('[Enter]');
    });

    const popoverTitle = screen.getByRole('heading', { name: 'secure-connection-title' });
    expect(popoverTitle).toBeInTheDocument();

    await act(async () => {
      await userEvent.keyboard('[Escape]');
    });
    expect(popoverTitle).not.toBeInTheDocument();
  });
  it('should show the guest participant popover message when a guest is present', async () => {
    const { store } = mockStore(NUMBER_OF_PARTICIPANTS, { participantKinds: [ParticipationKind.Guest] });
    await render(<SecurityBadge />, store);

    const button = screen.getByRole('button', { name: 'secure-connection-button-label' });
    expect(screen.queryByText('secure-connection-title')).not.toBeInTheDocument();

    await act(async () => {
      await userEvent.click(button);
    });

    expect(screen.getByText('secure-connection-guests')).toBeInTheDocument();

    await act(async () => {
      await userEvent.click(button);
    });
    expect(screen.queryByText('secure-connection-guests')).not.toBeInTheDocument();
  });
  it('should show the sip participant popover message when a sip user is present', async () => {
    const { store } = mockStore(NUMBER_OF_PARTICIPANTS, { participantKinds: [ParticipationKind.Sip] });
    await render(<SecurityBadge />, store);

    const button = screen.getByRole('button', { name: 'secure-connection-button-label' });
    expect(screen.queryByText('secure-connection-title')).not.toBeInTheDocument();

    await act(async () => {
      await userEvent.click(button);
    });

    expect(screen.getByText('secure-connection-sip')).toBeInTheDocument();
    expect(screen.queryByText('secure-connection-guests')).not.toBeInTheDocument();

    await act(async () => {
      await userEvent.click(button);
    });

    expect(screen.queryByText('secure-connection-sip')).not.toBeInTheDocument();
  });
  it('should show the mixed popover message when a sip user and a guest user is present', async () => {
    const { store } = mockStore(NUMBER_OF_PARTICIPANTS, {
      participantKinds: [ParticipationKind.Sip, ParticipationKind.Guest],
    });
    await render(<SecurityBadge />, store);

    const button = screen.getByRole('button', { name: 'secure-connection-button-label' });
    expect(screen.queryByText('secure-connection-title')).not.toBeInTheDocument();

    await act(async () => {
      await userEvent.click(button);
    });

    expect(screen.getByText('secure-connection-contaminated')).toBeInTheDocument();
    expect(screen.queryByText('secure-connection-guests')).not.toBeInTheDocument();
    expect(screen.queryByText('secure-connection-sip')).not.toBeInTheDocument();

    await act(async () => {
      await userEvent.click(button);
    });

    expect(screen.queryByText('secure-connection-contaminated')).not.toBeInTheDocument();
  });
});
