// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuList } from '@mui/material';
import { BackendModules, TranscriptionFeatures } from '@opentalk/rest-api-rtk-query';
import { screen } from '@testing-library/react';
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event';

import { hideSubtitles, showSubtitles, showTranscriptionSettings } from '../../../store/slices/transcriptionSlice';
import { Role } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import { HideSubtitlesMenuItem, ShowSubtitlesMenuItem, SubtitleSettingsMenuItem } from './SubtitleMenuItems';

interface RenderOptions {
  featureAvailable?: boolean;
  highSecurityEnabled?: boolean;
  role?: Role;
  subtitlesEnabled?: boolean;
  subtitlesShown?: boolean;
  automaticMeetingProtocolOnly?: boolean;
}

const renderSubtitleMenuItems = ({
  featureAvailable = true,
  highSecurityEnabled = false,
  role = Role.Moderator,
  subtitlesEnabled = false,
  subtitlesShown = false,
  automaticMeetingProtocolOnly = false,
}: RenderOptions = {}) => {
  const { store, dispatchSpy } = configureStore({
    initialState: {
      user: { role },
      config: {
        provider: { accountManagementUrl: 'https://account.opentalk.eu' },
        enabledModules: featureAvailable
          ? { [BackendModules.Transcription]: [TranscriptionFeatures.Transcription] }
          : {},
      },
      room: { eventInfo: { e2eEncryption: highSecurityEnabled } },
      transcription: {
        status: subtitlesEnabled || automaticMeetingProtocolOnly ? 'running' : 'inactive',
        liveTranscription: subtitlesEnabled,
        automaticMeetingProtocol: automaticMeetingProtocolOnly ? { pseudonymous: false, paused: false } : null,
        segments: [],
        showSubtitles: subtitlesShown,
      },
    },
  });

  renderWithProviders(
    <MenuList>
      <SubtitleSettingsMenuItem onClose={vi.fn()} />
      <ShowSubtitlesMenuItem onClose={vi.fn()} />
      <HideSubtitlesMenuItem onClose={vi.fn()} />
    </MenuList>,
    { store, provider: { mui: true, snackbar: true } }
  );

  return { dispatchSpy };
};

type ButtonState = 'hidden' | 'disabled' | 'active';

const getMenuItemState = (name: string): ButtonState => {
  const menuItem = screen.queryByRole('menuitem', { name });
  if (!menuItem) {
    return 'hidden';
  }
  return menuItem.getAttribute('aria-disabled') === 'true' ? 'disabled' : 'active';
};

describe('SubtitleMenuItems', () => {
  describe('when the subtitle feature is not available', () => {
    it('renders no subtitle items', () => {
      renderSubtitleMenuItems({ featureAvailable: false, subtitlesEnabled: true });

      expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
    });

    it('renders no subtitle items when high security is enabled', () => {
      renderSubtitleMenuItems({ featureAvailable: false, highSecurityEnabled: true, subtitlesEnabled: true });

      expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
    });
  });

  describe('when high security is enabled', () => {
    it('greys out the enable subtitles item for moderators', () => {
      renderSubtitleMenuItems({ highSecurityEnabled: true });

      expect(getMenuItemState('more-menu-subtitle-enable')).toBe('disabled');
    });

    it('does not render the enable subtitles item for participants', () => {
      renderSubtitleMenuItems({ highSecurityEnabled: true, role: Role.User });

      expect(getMenuItemState('more-menu-subtitle-enable')).toBe('hidden');
    });

    it('shows a high security tooltip on the enable subtitles item', async () => {
      const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });
      renderSubtitleMenuItems({ highSecurityEnabled: true });

      await user.hover(screen.getByRole('menuitem', { name: 'more-menu-subtitle-enable' }));

      expect(await screen.findByRole('tooltip')).toHaveTextContent('more-menu-high-security-tooltip');
    });

    it('greys out the show subtitles item even when subtitles are on', () => {
      renderSubtitleMenuItems({ highSecurityEnabled: true, subtitlesEnabled: true });

      expect(getMenuItemState('more-menu-show-subtitles')).toBe('disabled');
    });

    it('greys out the hide subtitles item even when subtitles are on and shown locally', () => {
      renderSubtitleMenuItems({ highSecurityEnabled: true, subtitlesEnabled: true, subtitlesShown: true });

      expect(getMenuItemState('more-menu-hide-subtitles')).toBe('disabled');
    });

    it('greys out the show subtitles item for participants', () => {
      renderSubtitleMenuItems({ highSecurityEnabled: true, role: Role.User, subtitlesEnabled: true });

      expect(getMenuItemState('more-menu-show-subtitles')).toBe('disabled');
    });

    it('shows a high security tooltip on the show subtitles item', async () => {
      const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });
      renderSubtitleMenuItems({ highSecurityEnabled: true, subtitlesEnabled: true });

      await user.hover(screen.getByRole('menuitem', { name: 'more-menu-show-subtitles' }));

      expect(await screen.findByRole('tooltip')).toHaveTextContent('more-menu-high-security-tooltip');
    });

    it('shows a high security tooltip on the hide subtitles item', async () => {
      const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });
      renderSubtitleMenuItems({ highSecurityEnabled: true, subtitlesEnabled: true, subtitlesShown: true });

      await user.hover(screen.getByRole('menuitem', { name: 'more-menu-hide-subtitles' }));

      expect(await screen.findByRole('tooltip')).toHaveTextContent('more-menu-high-security-tooltip');
    });
  });

  describe('when subtitles are off for the conference', () => {
    it('labels the moderator item as enable subtitles', () => {
      renderSubtitleMenuItems();

      expect(getMenuItemState('more-menu-subtitle-enable')).toBe('active');
      expect(getMenuItemState('more-menu-subtitle-settings')).toBe('hidden');
    });

    it('greys out the show subtitles item', () => {
      renderSubtitleMenuItems({ subtitlesShown: false });

      expect(getMenuItemState('more-menu-show-subtitles')).toBe('disabled');
    });

    it('greys out the hide subtitles item when subtitles are still shown locally', () => {
      renderSubtitleMenuItems({ subtitlesShown: true });

      expect(getMenuItemState('more-menu-hide-subtitles')).toBe('disabled');
    });

    it('offers to enable subtitles while the service only runs for the automatic meeting protocol', () => {
      renderSubtitleMenuItems({ automaticMeetingProtocolOnly: true });

      expect(getMenuItemState('more-menu-subtitle-enable')).toBe('active');
      expect(getMenuItemState('more-menu-show-subtitles')).toBe('disabled');
    });
  });

  describe('when the user is not a moderator', () => {
    it('hides the enable subtitles item and shows an active show subtitles item when subtitles are on', () => {
      renderSubtitleMenuItems({ role: Role.User, subtitlesEnabled: true });

      expect(getMenuItemState('more-menu-subtitle-settings')).toBe('hidden');
      expect(getMenuItemState('more-menu-show-subtitles')).toBe('active');
    });

    it('hides the enable subtitles item and greys out the show subtitles item when subtitles are off', () => {
      renderSubtitleMenuItems({ role: Role.User, subtitlesEnabled: false });

      expect(getMenuItemState('more-menu-subtitle-enable')).toBe('hidden');
      expect(getMenuItemState('more-menu-show-subtitles')).toBe('disabled');
    });
  });

  describe('when high security is disabled', () => {
    it('does not show a high security tooltip on the enable subtitles item', async () => {
      const user = userEvent.setup();
      renderSubtitleMenuItems();

      await user.hover(screen.getByRole('menuitem', { name: 'more-menu-subtitle-enable' }));

      // wait past the tooltip's enter delay before asserting that none appeared
      await expect(screen.findByRole('tooltip')).rejects.toThrow();
    });
  });

  it('dispatches showSubtitles when the show subtitles item is clicked', async () => {
    const user = userEvent.setup();
    const { dispatchSpy } = renderSubtitleMenuItems({ subtitlesEnabled: true });

    await user.click(screen.getByRole('menuitem', { name: 'more-menu-show-subtitles' }));

    expect(dispatchSpy).toHaveBeenCalledWith(showSubtitles());
  });

  it('dispatches hideSubtitles when the hide subtitles item is clicked', async () => {
    const user = userEvent.setup();
    const { dispatchSpy } = renderSubtitleMenuItems({ subtitlesEnabled: true, subtitlesShown: true });

    await user.click(screen.getByRole('menuitem', { name: 'more-menu-hide-subtitles' }));

    expect(dispatchSpy).toHaveBeenCalledWith(hideSubtitles());
  });

  it('dispatches the settings action when the settings item is clicked', async () => {
    const user = userEvent.setup();
    const { dispatchSpy } = renderSubtitleMenuItems();

    await user.click(screen.getByRole('menuitem', { name: 'more-menu-subtitle-enable' }));

    expect(dispatchSpy).toHaveBeenCalledWith(showTranscriptionSettings());
  });
});
