// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import { BreakroomsIcon } from '../../../assets/icons';
import { notifications } from '../../../commonComponents';
import { renderWithProviders, configureStore } from '../../../utils/testUtils';
import BreakoutRoomNotification, { Action } from './BreakoutRoomNotification';

const actionFn = jest.fn();

const SNACKBAR_KEY = 'test';
const ACTIONS: Array<Action> = [
  {
    text: 'TestButton',
    onClick: actionFn,
  },
  {
    text: 'TestButton2',
    onClick: actionFn,
  },
];
const MESSAGE = 'testMessage';

describe('BreakoutRoomNotification', () => {
  it('render all items', async () => {
    const { store } = configureStore();
    renderWithProviders(
      <BreakoutRoomNotification
        snackbarKey={SNACKBAR_KEY}
        actions={ACTIONS}
        message={MESSAGE}
        iconComponent={BreakroomsIcon}
      />,
      { store, provider: { snackbar: true, mui: true } }
    );
    expect(await screen.findByText(MESSAGE)).toBeInTheDocument();
    expect(screen.getByText(ACTIONS[0].text)).toBeInTheDocument();
    expect(screen.getByText(ACTIONS[1].text)).toBeInTheDocument();
  });

  it('action called once', async () => {
    const { store } = configureStore();
    renderWithProviders(
      <BreakoutRoomNotification
        snackbarKey={SNACKBAR_KEY}
        actions={ACTIONS}
        message={MESSAGE}
        iconComponent={BreakroomsIcon}
      />,
      { store, provider: { snackbar: true, mui: true } }
    );
    const actionButton = await screen.findByRole('button', { name: ACTIONS[0].text });

    expect(actionFn).toHaveBeenCalledTimes(0);

    fireEvent.click(actionButton);
    fireEvent.click(actionButton);

    expect(actionFn).toHaveBeenCalledTimes(1);
  });

  it('close after click on an action', async () => {
    const { store } = configureStore();
    renderWithProviders(
      <BreakoutRoomNotification
        snackbarKey={SNACKBAR_KEY}
        actions={ACTIONS}
        message={MESSAGE}
        iconComponent={BreakroomsIcon}
      />,
      { store, provider: { snackbar: true, mui: true } }
    );
    const spyClose = jest.spyOn(notifications, 'close');

    const actionButton = await screen.findByRole('button', { name: ACTIONS[0].text });

    expect(spyClose).toHaveBeenCalledTimes(0);

    fireEvent.click(actionButton);

    expect(spyClose).toHaveBeenCalledTimes(1);
  });
});
