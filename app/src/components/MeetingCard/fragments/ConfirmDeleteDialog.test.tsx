// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ButtonProps } from '@mui/material';
import { fireEvent, screen } from '@testing-library/react';

import { renderWithProviders, eventMockedData } from '../../../utils/testUtils';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

vi.mock('@mui/material', async (importOriginal) => ({
  ...(await importOriginal()),
  //Prevents TouchRipple error on autofocus of button
  Button: (props: ButtonProps) => (
    <button aria-label={props['aria-label']} onClick={props.onClick}>
      {props.children}
    </button>
  ),
}));

const mockDeleteEvent = vi.fn();
const mockDeleteEventResponse = {
  error: false,
};
const mockCloseEvent = vi.fn();

vi.mock('../../../api/rest', async (importOriginal) => ({
  ...(await importOriginal()),
  useUpdateEventInstanceMutation: () => [
    vi.fn(),
    {
      isLoading: false,
    },
  ],
  useDeleteEventMutation: () => [
    //Prevents issues with hasFetchError trying to read "undefined" in response.error
    mockDeleteEvent.mockImplementation(() => mockDeleteEventResponse),
    {
      isLoading: false,
    },
  ],
}));

const mockDialogProps = {
  event: eventMockedData,
  open: true,
  onClose: mockCloseEvent,
};

describe('ConfirmDeleteDialog', () => {
  it('renders without crashing', () => {
    renderWithProviders(<ConfirmDeleteDialog {...mockDialogProps} />, {});

    expect(screen.getByText('dashboard-meeting-card-delete-dialog-title')).toBeInTheDocument();
  });
  it('does not render if dialog is not open', () => {
    renderWithProviders(<ConfirmDeleteDialog {...mockDialogProps} open={false} />, {});

    expect(screen.queryByText('dashboard-meeting-card-delete-dialog-title')).not.toBeInTheDocument();
  });
  it('closes dialog when pressing close button', () => {
    renderWithProviders(<ConfirmDeleteDialog {...mockDialogProps} />, {});

    const closeButton = screen.getByRole('button', { name: 'global-close-dialog' });
    fireEvent.click(closeButton);

    expect(mockCloseEvent).toHaveBeenCalledTimes(1);
  });
  it('deletes event when pressing delete button', () => {
    renderWithProviders(<ConfirmDeleteDialog {...mockDialogProps} />, {});

    const deleteButton = screen.getByRole('button', { name: 'dashboard-meeting-card-delete-dialog-ok' });
    fireEvent.click(deleteButton);

    expect(mockDeleteEvent).toHaveBeenCalledTimes(1);
  });
});
