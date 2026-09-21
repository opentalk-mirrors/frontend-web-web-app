// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuList } from '@mui/material';
import { BackendModules, TranscriptionFeatures } from '@opentalk/rest-api-rtk-query';
import { screen } from '@testing-library/react';
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event';

import { showTranscriptionSettings } from '../../../store/slices/transcriptionSlice';
import { Role } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import { HideSubtitlesMenuItem, ShowSubtitlesMenuItem, SubtitleSettingsMenuItem } from './SubtitleMenuItems';

const config = {
  provider: { accountManagementUrl: 'https://account.opentalk.eu' },
  enabledModules: { [BackendModules.Transcription]: [TranscriptionFeatures.Transcription] },
};

const renderSubtitleMenuItems = (initialState = {}) => {
  const { store, dispatchSpy } = configureStore({
    initialState: {
      user: { role: Role.Moderator },
      config,
      ...initialState,
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

describe('SubtitleMenuItems', () => {
  it('shows the enable settings item while transcription is inactive', () => {
    renderSubtitleMenuItems({ transcription: { status: 'inactive', segments: [], showSubtitles: false } });

    expect(screen.getByRole('menuitem', { name: 'more-menu-subtitle-enable' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'more-menu-show-subtitles' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows subtitle settings while transcription is running', () => {
    renderSubtitleMenuItems({ transcription: { status: 'running', segments: [], showSubtitles: false } });

    expect(screen.getByRole('menuitem', { name: 'more-menu-subtitle-settings' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'more-menu-show-subtitles' })).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('shows the hide subtitles item when subtitles are visible', () => {
    renderSubtitleMenuItems({ transcription: { status: 'running', segments: [], showSubtitles: true } });

    expect(screen.getByRole('menuitem', { name: 'more-menu-hide-subtitles' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'more-menu-show-subtitles' })).not.toBeInTheDocument();
  });

  it('dispatches the settings action when the settings item is clicked', async () => {
    const user = userEvent.setup();
    const { dispatchSpy } = renderSubtitleMenuItems({
      transcription: { status: 'inactive', segments: [], showSubtitles: false },
    });

    await user.click(screen.getByRole('menuitem', { name: 'more-menu-subtitle-enable' }));

    expect(dispatchSpy).toHaveBeenCalledWith(showTranscriptionSettings());
  });

  it('does not render subtitle items when the feature is disabled', () => {
    renderSubtitleMenuItems({ config: { provider: config.provider, enabledModules: {} } });

    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });

  describe('when high security (e2ee) is enabled', () => {
    const renderWithHighSecurity = () =>
      renderSubtitleMenuItems({
        room: { eventInfo: { e2eEncryption: true } },
        transcription: { status: 'inactive', segments: [], showSubtitles: false },
      });

    it('greys out the subtitle settings item', () => {
      renderWithHighSecurity();

      expect(screen.getByRole('menuitem', { name: 'more-menu-subtitle-enable' })).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });

    it('shows a high security tooltip on the subtitle settings item', async () => {
      const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });
      renderWithHighSecurity();

      await user.hover(screen.getByRole('menuitem', { name: 'more-menu-subtitle-enable' }));

      expect(await screen.findByRole('tooltip')).toHaveTextContent('more-menu-high-security-tooltip');
    });
  });
});
