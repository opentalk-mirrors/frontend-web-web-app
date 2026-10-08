// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuList } from '@mui/material';
import { BackendModules, RecordingFeatures, StreamingStatus } from '@opentalk/rest-api-rtk-query';
import { screen } from '@testing-library/react';
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event';

import { sendStartRecordingSignal, sendStopRecordingSignal } from '../../../api/types/outgoing/streaming';
import { Role } from '../../../types';
import { renderWithProviders, configureStore } from '../../../utils/testUtils';
import RecordingMenuItem from './RecordingMenuItem';

vi.mock('../../../modules/WebRTC/ConferenceRoom', async (importOriginal) => ({
  ...(await importOriginal()),
  getCurrentConferenceRoom: () => ({
    sendMessage: vi.fn(),
  }),
}));

const recordingModuleConfig = {
  provider: { accountManagementUrl: 'https://account.opentalk.eu' },
  enabledModules: { [BackendModules.Recording]: [RecordingFeatures.Record] },
};

const renderRecordingMenuItem = (options?: {
  recordingStatus?: StreamingStatus;
  enabledModules?: object;
  onClose?: () => void;
  highSecurityEnabled?: boolean;
}) => {
  const onClose = options?.onClose ?? vi.fn();
  const { store, dispatchSpy } = configureStore({
    initialState: {
      user: { role: Role.Moderator },
      room: { eventInfo: { e2eEncryption: options?.highSecurityEnabled ?? false } },
      streaming: {
        recording: options?.recordingStatus ?? StreamingStatus.Inactive,
        streams: { ids: [], entities: {} },
      },
      config: {
        ...recordingModuleConfig,
        enabledModules: options?.enabledModules ?? recordingModuleConfig.enabledModules,
      },
    },
  });

  renderWithProviders(
    <MenuList>
      <RecordingMenuItem onClose={onClose} />
    </MenuList>,
    {
      store,
      provider: { mui: true, snackbar: true },
    }
  );

  return { onClose, dispatchSpy };
};

describe('RecordingMenuItem', () => {
  it('renders nothing if the recording feature is disabled', () => {
    renderRecordingMenuItem({ enabledModules: {} });
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });

  it('shows the start recording option when recording is inactive', () => {
    renderRecordingMenuItem({ recordingStatus: StreamingStatus.Inactive });
    expect(screen.getByRole('menuitem', { name: 'more-menu-start-recording' })).toBeInTheDocument();
  });

  it('dispatches the start recording signal and closes the menu when clicked', async () => {
    const user = userEvent.setup();
    const { onClose, dispatchSpy } = renderRecordingMenuItem({ recordingStatus: StreamingStatus.Inactive });

    await user.click(screen.getByRole('menuitem', { name: 'more-menu-start-recording' }));

    expect(dispatchSpy).toHaveBeenCalledWith(sendStartRecordingSignal.action());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables the start recording option after the first click while awaiting server status', async () => {
    const user = userEvent.setup();
    renderRecordingMenuItem({ recordingStatus: StreamingStatus.Inactive });

    const startRecordingItem = screen.getByRole('menuitem', { name: 'more-menu-start-recording' });
    await user.click(startRecordingItem);

    expect(startRecordingItem).toHaveAttribute('aria-disabled', 'true');
    await expect(user.click(startRecordingItem)).rejects.toThrow(/pointer-events: none/);
  });

  it('shows the stop recording option when recording is active', () => {
    renderRecordingMenuItem({ recordingStatus: StreamingStatus.Active });
    expect(screen.getByRole('menuitem', { name: 'more-menu-stop-recording' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'more-menu-start-recording' })).not.toBeInTheDocument();
  });

  it('dispatches the stop recording signal and closes the menu when clicked', async () => {
    const user = userEvent.setup();
    const { onClose, dispatchSpy } = renderRecordingMenuItem({ recordingStatus: StreamingStatus.Active });

    await user.click(screen.getByRole('menuitem', { name: 'more-menu-stop-recording' }));

    expect(dispatchSpy).toHaveBeenCalledWith(sendStopRecordingSignal.action());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows a disabled start recording option when recording was requested', () => {
    renderRecordingMenuItem({ recordingStatus: StreamingStatus.Requested });
    const menuItem = screen.getByRole('menuitem', { name: 'more-menu-start-recording' });
    expect(menuItem).toBeInTheDocument();
  });

  describe('when high security (e2ee) is enabled', () => {
    it('greys out the start recording item', () => {
      renderRecordingMenuItem({ recordingStatus: StreamingStatus.Inactive, highSecurityEnabled: true });

      expect(screen.getByRole('menuitem', { name: 'more-menu-start-recording' })).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });

    it('shows a high security tooltip on the start recording item', async () => {
      const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });
      renderRecordingMenuItem({ recordingStatus: StreamingStatus.Inactive, highSecurityEnabled: true });

      await user.hover(screen.getByRole('menuitem', { name: 'more-menu-start-recording' }));

      expect(await screen.findByRole('tooltip')).toHaveTextContent('more-menu-high-security-tooltip');
    });
  });
});
