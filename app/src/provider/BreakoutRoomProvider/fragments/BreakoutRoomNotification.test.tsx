// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { cleanup } from '@testing-library/react';
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
  afterEach(() => cleanup());
  test('render all items', () => {
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
    expect(screen.getByText(MESSAGE)).toBeInTheDocument();
    expect(screen.getByText(ACTIONS[0].text)).toBeInTheDocument();
    expect(screen.getByText(ACTIONS[1].text)).toBeInTheDocument();
  });

  test('action called once', () => {
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
    expect(screen.getByText(MESSAGE)).toBeInTheDocument();

    expect(actionFn).toHaveBeenCalledTimes(0);

    fireEvent.click(screen.getByText(ACTIONS[0].text));
    fireEvent.click(screen.getByText(ACTIONS[0].text));

    expect(actionFn).toHaveBeenCalledTimes(1);
  });

  test('close after click on an action', () => {
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

    expect(screen.getByText(MESSAGE)).toBeInTheDocument();

    expect(spyClose).toHaveBeenCalledTimes(0);

    fireEvent.click(screen.getByText(ACTIONS[0].text));

    expect(spyClose).toHaveBeenCalledTimes(1);
  });
});
