// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, render, within } from '@testing-library/react';

import type { Hotkey } from '../../../store/slices/hotkeys/types';
import HotkeyTable from './HotkeyTable';

vi.mock('../../../store/slices/hotkeys/listener', async (importOriginal) => ({
  ...(await importOriginal()),
  hotkeys: [
    {
      descriptionKey: 'hotkey-1',
      key: 'S',
      modifier: 'Control',
      onPress: () => {},
    },
    {
      descriptionKey: 'hotkey-2',
      key: 'd',
      modifier: ['Control', 'Shift'],
      onPress: () => {},
    },
    {
      descriptionKey: 'hotkey-3',
      key: 'e',
      onPress: () => {},
      onRelease: () => {},
    },
  ] as Hotkey[],
}));

describe('HotkeyTable', () => {
  it('should render hotkey cells', () => {
    render(<HotkeyTable />);

    expect(screen.getByRole('cell', { name: 'modifier-control + s' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'hotkey-1' })).toBeInTheDocument();

    expect(screen.getByRole('cell', { name: 'modifier-control + modifier-shift + d' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'hotkey-2' })).toBeInTheDocument();

    expect(screen.getByRole('cell', { name: 'e' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'hotkey-3' })).toBeInTheDocument();
  });

  it('should render hotkey sections', () => {
    render(<HotkeyTable />);

    expect(screen.getByText('my-meeting-menu-hotkeys-table-toggle-title')).toBeInTheDocument();
    expect(screen.getByText('my-meeting-menu-hotkeys-table-p2t-title')).toBeInTheDocument();
  });

  it('should render the push2talk description in the right section', () => {
    render(<HotkeyTable />);

    const tables = screen.getAllByRole('table');
    const pushToTalkTable = tables[1];

    expect(within(pushToTalkTable).queryByText('hotkey-2')).not.toBeInTheDocument();
    expect(within(pushToTalkTable).getByText('hotkey-3')).toBeInTheDocument();
  });
});
