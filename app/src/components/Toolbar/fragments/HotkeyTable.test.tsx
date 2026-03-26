// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, render } from '@testing-library/react';

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
      onPress: () => {},
    },
  ] as Hotkey[],
}));

describe('HotkeyTable', () => {
  it('should render table header', () => {
    render(<HotkeyTable />);

    expect(screen.getByRole('columnheader', { name: 'global-hotkey' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'global-description' })).toBeInTheDocument();
  });

  it('should render hotkey cells', () => {
    render(<HotkeyTable />);

    expect(screen.getByRole('cell', { name: 'modifier-control + s' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'hotkey-1' })).toBeInTheDocument();

    expect(screen.getByRole('cell', { name: 'd' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'hotkey-2' })).toBeInTheDocument();
  });
});
