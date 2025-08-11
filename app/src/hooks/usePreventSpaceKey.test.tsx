// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Switch } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mock } from 'vitest';

import { useHotkeysActive } from './useHotkeys';
import { usePreventSpaceKey } from './usePreventSpaceKey';

vi.mock('./useHotkeys');

interface WithProps {
  handleChange: Mock;
}

function WithButton(props: WithProps) {
  const { handleChange } = props;
  usePreventSpaceKey();
  return <Button onClick={handleChange} />;
}

function WithSwitch(props: WithProps) {
  const { handleChange } = props;
  usePreventSpaceKey();
  return <Switch onChange={handleChange} />;
}

describe('usePreventSpaceKey', () => {
  describe('shortkeys are enabled', () => {
    beforeEach(() => {
      (useHotkeysActive as Mock).mockReturnValue(true);
    });
    it('prevents space key for a button', async () => {
      const handleChange = vi.fn();
      render(<WithButton handleChange={handleChange} />);

      const button = screen.getByRole('button');
      await userEvent.tab();
      expect(button).toHaveFocus();

      await userEvent.keyboard('[Space]');
      expect(handleChange).not.toHaveBeenCalled();
    });
    it('prevents space key for a switch', async () => {
      const handleChange = vi.fn();
      render(<WithSwitch handleChange={handleChange} />);

      const switchElement = screen.getByRole('switch');
      await userEvent.tab();
      expect(switchElement).toHaveFocus();

      await userEvent.keyboard('[Space]');
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('shortkeys are disabled', () => {
    beforeEach(() => {
      (useHotkeysActive as Mock).mockReturnValue(false);
    });
    it('does not prevent space key for a button', async () => {
      const handleChange = vi.fn();
      render(<WithButton handleChange={handleChange} />);

      const button = screen.getByRole('button');
      await userEvent.tab();
      expect(button).toHaveFocus();

      await userEvent.keyboard('[Space]');
      expect(handleChange).toHaveBeenCalled();
    });
    it('does not prevent space key for a switch', async () => {
      const handleChange = vi.fn();
      render(<WithSwitch handleChange={handleChange} />);

      const switchElement = screen.getByRole('switch');
      await userEvent.tab();
      expect(switchElement).toHaveFocus();

      await userEvent.keyboard('[Space]');
      expect(handleChange).toHaveBeenCalled();
    });
  });
});
