// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { CoreFeatures } from '@opentalk/rest-api-rtk-query';
import { screen } from '@testing-library/react';

import { renderWithProviders, configureStore } from '../../../utils/testUtils';
import { mockedSingleEvent } from '../../../utils/testUtils';
import type { GuestLinkFieldProps } from './GuestLinkField';
import type { MeetingLinkFieldProps } from './MeetingLinkField';
import MeetingLinksAndPasswords from './MeetingLinksAndPasswords';

const MOCK_BASE_URL = 'http://localhost:3000';

vi.mock('./MeetingLinkField', () => ({
  __esModule: true,
  default: (props: MeetingLinkFieldProps) => {
    const { fieldKey } = props;
    return <div data-testid={`meeting-link-field-${fieldKey}`} />;
  },
}));

vi.mock('./GuestLinkField', () => ({
  __esModule: true,
  default: (props: GuestLinkFieldProps) => {
    const { roomId, eventCreatorId, baseURL } = props;
    return (
      <div data-testid="guest-link-field">
        <span>{roomId}</span>
        <span>{eventCreatorId}</span>
        <span>{baseURL}</span>
      </div>
    );
  },
}));

let mockCoreFeatures: Array<CoreFeatures> = [];
vi.mock('../../../api/rest', async (importOriginal) => ({
  ...(await importOriginal()),
  useGetRoomTariffQuery: () => ({
    data: {
      modules: {
        core: {
          features: mockCoreFeatures,
        },
      },
    },
  }),
}));

describe('MeetingLinksAndPasswords component tests', () => {
  const { store } = configureStore({
    initialState: {
      config: {
        baseUrl: MOCK_BASE_URL,
        features: {
          sharedFolder: true,
        },
      },
    },
  });

  beforeEach(() => {
    mockCoreFeatures = ['guests_allowed'];
  });

  describe('rendering of guest link field', () => {
    it('does not render guest link field if guests allowed core feature is absent', () => {
      mockCoreFeatures = [];
      renderWithProviders(<MeetingLinksAndPasswords event={mockedSingleEvent} />, { store });
      expect(screen.queryByTestId('guest-link-field')).not.toBeInTheDocument();
    });
    it('does not render guest link field if e2e encryption is activated', () => {
      const eventWithE2EE = {
        ...mockedSingleEvent,
        room: {
          ...mockedSingleEvent.room,
          e2eEncryption: true,
        },
      };
      renderWithProviders(<MeetingLinksAndPasswords event={eventWithE2EE} />, { store });
      expect(screen.queryByTestId('guest-link-field')).not.toBeInTheDocument();
    });
    it('renders guest link field if guests allowed core feature is present', () => {
      renderWithProviders(<MeetingLinksAndPasswords event={mockedSingleEvent} />, { store });
      expect(screen.getByTestId('guest-link-field')).toBeInTheDocument();
    });
    it('passes event creator id to the guest link field', () => {
      renderWithProviders(<MeetingLinksAndPasswords event={mockedSingleEvent} />, { store });
      expect(screen.getByText(mockedSingleEvent.createdBy.id)).toBeInTheDocument();
    });
    it('passes room id id to the guest link field', () => {
      renderWithProviders(<MeetingLinksAndPasswords event={mockedSingleEvent} />, { store });
      expect(screen.getByText(mockedSingleEvent.room.id)).toBeInTheDocument();
    });
    it('passes base URL to the guest link field', () => {
      renderWithProviders(<MeetingLinksAndPasswords event={mockedSingleEvent} />, { store });
      expect(screen.getByText(MOCK_BASE_URL)).toBeInTheDocument();
    });
  });
});
