// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { UserId } from '@opentalk/rest-api-rtk-query';
import { screen, fireEvent } from '@testing-library/react';

import { renderWithProviders, configureStore } from '../../../utils/testUtils';
import EndCallButton from './EndCallButton';

vi.mock('../../../api/rest', async (importOriginal) => ({
  ...(await importOriginal()),
  useGetMeQuery: () => ({
    data: {
      id: '3645d74d-9a4b-4cd4-9d9f-f1871c970167' as UserId,
    },
  }),
  useGetRoomQuery: () => ({
    data: {
      createdBy: {
        id: '3645d74d-9a4b-4cd4-9d9f-f1871c970167' as UserId,
      },
    },
  }),
  useGetEventQuery: () => ({}),
}));
describe('<EndCallButton />', () => {
  const { store } = configureStore();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render EndCallButton component', () => {
    renderWithProviders(<EndCallButton />, { store, provider: { snackbar: true, router: true } });
    expect(screen.getByTestId('toolbarEndCallButton')).toBeInTheDocument();
  });

  it('If creator of meeting click on EndCallButton, popup should be displayed with delete room option', async () => {
    renderWithProviders(<EndCallButton />, { store, provider: { snackbar: true, router: true } });
    const endButton = await screen.findByTestId('toolbarEndCallButton');
    expect(endButton).toBeInTheDocument();

    expect(screen.queryByLabelText('meeting-delete-metadata-dialog-title')).not.toBeInTheDocument();

    fireEvent.click(endButton);

    const closeMeetingButton = await screen.findByText('meeting-delete-metadata-button-leave-and-delete');

    expect(screen.getByLabelText('meeting-delete-metadata-dialog-title')).toBeInTheDocument();
    expect(closeMeetingButton).toBeInTheDocument();
    expect(screen.getByText('meeting-delete-metadata-button-leave-without-delete')).toBeInTheDocument();
  });

  it('should dispatch leave by clicking on leaveWithoutDeletingButton', async () => {
    renderWithProviders(<EndCallButton />, { store, provider: { snackbar: true, router: true } });
    const endButton = await screen.findByTestId('toolbarEndCallButton');
    expect(endButton).toBeInTheDocument();

    fireEvent.click(endButton);

    let leaveWithoutDeletingButton = null;
    leaveWithoutDeletingButton = await screen.findByText('meeting-delete-metadata-button-leave-and-delete');

    expect(leaveWithoutDeletingButton).toBeInTheDocument();
    expect(screen.getByText('meeting-delete-metadata-button-leave-without-delete')).toBeInTheDocument();

    /* TODO the hangup ('room/hangup/pending')  thunks is undefined here

    fireEvent.click(leaveWithoutDeletingButton);

    await waitFor(() => {
      expect(dispatch.mock.calls).toMatchObject([
        [{ payload: undefined, type: 'auth/loaded' }],
        [{ payload: undefined, type: 'room/hangup/pending' }],
      ]);
    });*/
  });

  it('should dispatch delete and leave by clicking on deleteMeeting button', async () => {
    renderWithProviders(<EndCallButton />, { store, provider: { snackbar: true, router: true } });
    const endButton = await screen.findByTestId('toolbarEndCallButton');

    expect(endButton).toBeInTheDocument();

    fireEvent.click(endButton);

    const deleteMeeting = await screen.findByText('meeting-delete-metadata-button-leave-without-delete');
    expect(screen.getByText('meeting-delete-metadata-button-leave-and-delete')).toBeInTheDocument();
    expect(deleteMeeting).toBeInTheDocument();

    /* TODO the hangup ('room/hangup/pending')  thunks is undefined here

    fireEvent.click(deleteMeeting);

    await waitFor(() => {
      expect(dispatch.mock.calls).toEqual(
        expect.arrayContaining([
          [{ payload: undefined, type: 'auth/loaded' }],
          [{ payload: undefined, type: 'room/hangup/pending' }]
        ])
      );
    });*/
  });
});
