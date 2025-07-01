// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Switch } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useHotkeysActive } from './useHotkeys';
import { usePreventSpaceKey } from './usePreventSpaceKey';

jest.mock('./useHotkeys');

interface WithProps {
  handleChange: jest.Mock;
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
      (useHotkeysActive as jest.Mock).mockReturnValue(true);
    });
    it('prevents space key for a button', async () => {
      const handleChange = jest.fn();
      render(<WithButton handleChange={handleChange} />);

      const button = screen.getByRole('button');
      await userEvent.tab();
      expect(button).toHaveFocus();

      await userEvent.keyboard('[Space]');
      expect(handleChange).not.toHaveBeenCalled();
    });
    it('prevents space key for a switch', async () => {
      const handleChange = jest.fn();
      render(<WithSwitch handleChange={handleChange} />);

      const switchElement = screen.getByRole('checkbox');
      await userEvent.tab();
      expect(switchElement).toHaveFocus();

      await userEvent.keyboard('[Space]');
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('shortkeys are disabled', () => {
    beforeEach(() => {
      (useHotkeysActive as jest.Mock).mockReturnValue(false);
    });
    it('does not prevent space key for a button', async () => {
      const handleChange = jest.fn();
      render(<WithButton handleChange={handleChange} />);

      const button = screen.getByRole('button');
      await userEvent.tab();
      expect(button).toHaveFocus();

      await userEvent.keyboard('[Space]');
      expect(handleChange).toHaveBeenCalled();
    });
    it('does not prevent space key for a switch', async () => {
      const handleChange = jest.fn();
      render(<WithSwitch handleChange={handleChange} />);

      const switchElement = screen.getByRole('checkbox');
      await userEvent.tab();
      expect(switchElement).toHaveFocus();

      await userEvent.keyboard('[Space]');
      expect(handleChange).toHaveBeenCalled();
    });
  });
});
