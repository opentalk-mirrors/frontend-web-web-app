// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuList } from '@mui/material';
import { StreamStatus, StreamingTargetId } from '@opentalk/rest-api-rtk-query';
import { screen } from '@testing-library/react';
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event';

import { sendStartStreamSignal, sendStopStreamSignal } from '../../../api/types/outgoing/streaming';
import { Role } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import StreamingControlMenuItem from './StreamingControlMenuItem';

const renderStreamingControlMenuItem = (status?: StreamStatus, highSecurityEnabled = false) => {
  const streamId = 'stream-1' as StreamingTargetId;
  const { store, dispatchSpy } = configureStore({
    initialState: {
      user: { role: Role.Moderator },
      room: { eventInfo: { e2eEncryption: highSecurityEnabled } },
      streaming: {
        recording: 'inactive',
        consent: undefined,
        streams: status
          ? {
              ids: [streamId],
              entities: { [streamId]: { targetId: streamId, status } },
            }
          : { ids: [], entities: {} },
      },
    },
  });

  renderWithProviders(
    <MenuList>
      <StreamingControlMenuItem onClose={vi.fn()} />
    </MenuList>,
    { store, provider: { mui: true, snackbar: true } }
  );

  return { dispatchSpy };
};

describe('StreamingControlMenuItem', () => {
  it('does not render when no streaming target exists', () => {
    renderStreamingControlMenuItem();

    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });

  it('shows stop streaming for an active target and dispatches stop', async () => {
    const user = userEvent.setup();
    const { dispatchSpy } = renderStreamingControlMenuItem(StreamStatus.Active);

    await user.click(screen.getByRole('menuitem', { name: 'more-menu-stop-streaming' }));

    expect(dispatchSpy).toHaveBeenCalledWith(
      sendStopStreamSignal.action({ targetIds: ['stream-1' as StreamingTargetId] })
    );
  });

  it('shows start streaming for an inactive target and dispatches start', async () => {
    const user = userEvent.setup();
    const { dispatchSpy } = renderStreamingControlMenuItem(StreamStatus.Inactive);

    await user.click(screen.getByRole('menuitem', { name: 'more-menu-start-streaming' }));

    expect(dispatchSpy).toHaveBeenCalledWith(
      sendStartStreamSignal.action({ targetIds: ['stream-1' as StreamingTargetId] })
    );
  });

  describe('when high security (e2ee) is enabled', () => {
    it('greys out the start streaming item', () => {
      renderStreamingControlMenuItem(StreamStatus.Inactive, true);

      expect(screen.getByRole('menuitem', { name: 'more-menu-start-streaming' })).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });

    it('shows a high security tooltip on the start streaming item', async () => {
      const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });
      renderStreamingControlMenuItem(StreamStatus.Inactive, true);

      await user.hover(screen.getByRole('menuitem', { name: 'more-menu-start-streaming' }));

      expect(await screen.findByRole('tooltip')).toHaveTextContent('more-menu-high-security-tooltip');
    });
  });
});
