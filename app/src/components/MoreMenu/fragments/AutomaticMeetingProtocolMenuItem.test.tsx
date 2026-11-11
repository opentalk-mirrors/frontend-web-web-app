// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuList } from '@mui/material';
import { BackendModules, TranscriptionFeatures } from '@opentalk/rest-api-rtk-query';
import { screen } from '@testing-library/react';
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event';

import { AutomaticMeetingProtocolMode, TranscriptionStatus } from '../../../api/types/incoming/transcription';
import { sendStopAutomaticMeetingProtocolSignal } from '../../../api/types/outgoing/transcription';
import { showStorageNearLimitNotification } from '../../../commonComponents/Notistack/helper';
import { StorageStatus } from '../../../hooks/useStorageStatus';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import AutomaticMeetingProtocolMenuItem from './AutomaticMeetingProtocolMenuItem';

vi.mock('../../../commonComponents/Notistack/helper', () => ({
  showStorageNearLimitNotification: vi.fn(),
}));

vi.mock('../../../modules/WebRTC/ConferenceRoom', async (importOriginal) => ({
  ...(await importOriginal()),
  getCurrentConferenceRoom: () => ({
    sendMessage: vi.fn(),
  }),
}));

const transcriptionModuleConfig = {
  provider: { accountManagementUrl: 'https://account.opentalk.eu' },
  enabledModules: { [BackendModules.Transcription]: [TranscriptionFeatures.Transcription] },
};

const runningAutomaticMeetingProtocol: AutomaticMeetingProtocolMode = { pseudonymous: false, paused: false };

const renderAutomaticMeetingProtocolMenuItem = (options?: {
  transcriptionStatus?: TranscriptionStatus;
  automaticMeetingProtocol?: AutomaticMeetingProtocolMode | null;
  enabledModules?: object;
  highSecurityEnabled?: boolean;
  storageUsed?: number;
}) => {
  const onClose = vi.fn();
  const onStart = vi.fn();
  const { store, dispatchSpy } = configureStore({
    initialState: {
      room: { eventInfo: { e2eEncryption: options?.highSecurityEnabled ?? false } },
      transcription: {
        status: options?.transcriptionStatus ?? TranscriptionStatus.Inactive,
        automaticMeetingProtocol: options?.automaticMeetingProtocol ?? null,
      },
      config: {
        ...transcriptionModuleConfig,
        enabledModules: options?.enabledModules ?? transcriptionModuleConfig.enabledModules,
        ...(options?.storageUsed !== undefined && {
          tariff: {
            quotas: { maxStorage: 100 },
            usedQuota: { maxStorage: options.storageUsed },
          },
        }),
      },
    },
  });

  renderWithProviders(
    <MenuList>
      <AutomaticMeetingProtocolMenuItem onClose={onClose} onStart={onStart} />
    </MenuList>,
    {
      store,
      provider: { mui: true },
    }
  );

  return { onClose, onStart, dispatchSpy };
};

describe('AutomaticMeetingProtocolMenuItem', () => {
  beforeEach(() => {
    vi.mocked(showStorageNearLimitNotification).mockClear();
  });

  it('renders nothing if the transcription feature is disabled', () => {
    renderAutomaticMeetingProtocolMenuItem({ enabledModules: {} });
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });

  it('shows the start option when the transcription service is inactive and automatic meeting protocol is not running', () => {
    renderAutomaticMeetingProtocolMenuItem();
    expect(screen.getByRole('menuitem', { name: 'more-menu-start-automatic-meeting-protocol' })).toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'more-menu-stop-automatic-meeting-protocol' })
    ).not.toBeInTheDocument();
  });

  it('shows the start option when the transcription service is active and automatic meeting protocol is not running', () => {
    renderAutomaticMeetingProtocolMenuItem({
      transcriptionStatus: TranscriptionStatus.Running,
      automaticMeetingProtocol: null,
    });
    expect(screen.getByRole('menuitem', { name: 'more-menu-start-automatic-meeting-protocol' })).toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'more-menu-stop-automatic-meeting-protocol' })
    ).not.toBeInTheDocument();
  });

  it('shows the stop option when the automatic meeting protocol is running', () => {
    renderAutomaticMeetingProtocolMenuItem({
      transcriptionStatus: TranscriptionStatus.Running,
      automaticMeetingProtocol: runningAutomaticMeetingProtocol,
    });
    expect(screen.getByRole('menuitem', { name: 'more-menu-stop-automatic-meeting-protocol' })).toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'more-menu-start-automatic-meeting-protocol' })
    ).not.toBeInTheDocument();
  });

  it('calls onStart and onClose when the start option is clicked', async () => {
    const user = userEvent.setup();
    const { onClose, onStart } = renderAutomaticMeetingProtocolMenuItem();
    await user.click(screen.getByRole('menuitem', { name: 'more-menu-start-automatic-meeting-protocol' }));
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables the start option while transcription is requested', () => {
    renderAutomaticMeetingProtocolMenuItem({ transcriptionStatus: TranscriptionStatus.Requested });
    expect(screen.getByRole('menuitem', { name: 'more-menu-start-automatic-meeting-protocol' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('dispatches the stop automatic meeting protocol signal and closes the menu when the stop option is clicked', async () => {
    const user = userEvent.setup();
    const { onClose, onStart, dispatchSpy } = renderAutomaticMeetingProtocolMenuItem({
      transcriptionStatus: TranscriptionStatus.Running,
      automaticMeetingProtocol: runningAutomaticMeetingProtocol,
    });
    await user.click(screen.getByRole('menuitem', { name: 'more-menu-stop-automatic-meeting-protocol' }));
    expect(dispatchSpy).toHaveBeenCalledWith(sendStopAutomaticMeetingProtocolSignal.action());
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onStart).not.toHaveBeenCalled();
  });

  describe.each([
    { label: 'critical', storageUsed: 99 },
    { label: 'full', storageUsed: 100 },
  ])('when storage is $label', ({ storageUsed }) => {
    it('disables the start option', () => {
      renderAutomaticMeetingProtocolMenuItem({ storageUsed });
      expect(screen.getByRole('menuitem', { name: 'more-menu-start-automatic-meeting-protocol' })).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });

    it('shows a storage full tooltip on the start option', async () => {
      const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });
      renderAutomaticMeetingProtocolMenuItem({ storageUsed });
      await user.hover(screen.getByRole('menuitem', { name: 'more-menu-start-automatic-meeting-protocol' }));
      expect(await screen.findByRole('tooltip')).toHaveTextContent('conference-storage-tooltip-full-storage');
    });
  });

  describe('when storage is nearly full', () => {
    const storageUsed = 95;

    it('keeps the start option enabled', () => {
      renderAutomaticMeetingProtocolMenuItem({ storageUsed });
      expect(screen.getByRole('menuitem', { name: 'more-menu-start-automatic-meeting-protocol' })).not.toHaveAttribute(
        'aria-disabled'
      );
    });

    it('calls the storage near limit notification helper when the start option is clicked', async () => {
      const user = userEvent.setup();
      renderAutomaticMeetingProtocolMenuItem({ storageUsed });
      await user.click(screen.getByRole('menuitem', { name: 'more-menu-start-automatic-meeting-protocol' }));
      expect(showStorageNearLimitNotification).toHaveBeenCalledTimes(1);
      expect(showStorageNearLimitNotification).toHaveBeenCalledWith({
        storageStatus: StorageStatus.NearLimit,
        canUpgrade: false,
        accountManagementUrl: transcriptionModuleConfig.provider.accountManagementUrl,
      });
    });
  });

  describe('when high security is enabled', () => {
    it('disables the start option', () => {
      renderAutomaticMeetingProtocolMenuItem({ highSecurityEnabled: true });
      expect(screen.getByRole('menuitem', { name: 'more-menu-start-automatic-meeting-protocol' })).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });

    it('shows a high security tooltip on the start option', async () => {
      const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });
      renderAutomaticMeetingProtocolMenuItem({ highSecurityEnabled: true });
      await user.hover(screen.getByRole('menuitem', { name: 'more-menu-start-automatic-meeting-protocol' }));
      expect(await screen.findByRole('tooltip')).toHaveTextContent('more-menu-high-security-tooltip');
    });
  });
});
