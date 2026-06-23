// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import { supportsAudioOutputSelection } from 'livekit-client';
import { Mock } from 'vitest';

import useMediaDevice from '../../../hooks/useMediaDevice';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import { mockedAudioInputs } from '../../../utils/testUtils';
import AudioSettingsPanel from './AudioSettingsPanel';

vi.mock('./DeviceManager', () => ({
  default: () => <div>MockDeviceManager</div>,
}));

vi.mock('../../../hooks/useMediaDevice', () => ({
  default: vi.fn(),
}));

vi.mock('livekit-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('livekit-client')>()),
  supportsAudioOutputSelection: vi.fn(),
}));

const mockUseMediaDevice = useMediaDevice as Mock;
const mockSupportsAudioOutputSelection = supportsAudioOutputSelection as Mock;

describe('AudioSettingsPanel', () => {
  beforeEach(() => {
    mockUseMediaDevice.mockImplementation(() => ({
      loadLocalDevices: vi.fn(() => Promise.resolve(undefined)),
      localDevices: mockedAudioInputs,
      permissionDenied: false,
    }));
    mockSupportsAudioOutputSelection.mockReturnValue(true);
  });

  it('renders title and device managers for audio input and output', async () => {
    const { store } = configureStore();
    renderWithProviders(<AudioSettingsPanel />, { store });
    expect(screen.getByRole('heading', { name: 'audio-settings-title' })).toBeInTheDocument();
    expect(screen.getAllByText('MockDeviceManager')).toHaveLength(2);
  });

  it('hides the audio output device manager when output selection is not supported (e.g. Safari)', async () => {
    mockSupportsAudioOutputSelection.mockReturnValue(false);
    const { store } = configureStore();
    renderWithProviders(<AudioSettingsPanel />, { store });
    expect(screen.getByRole('heading', { name: 'audio-settings-title' })).toBeInTheDocument();
    expect(screen.getAllByText('MockDeviceManager')).toHaveLength(1);
  });
});
