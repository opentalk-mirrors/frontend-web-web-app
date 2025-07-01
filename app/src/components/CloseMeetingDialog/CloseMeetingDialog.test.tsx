// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import * as restAPI from '../../api/rest';
import { generateInstanceId } from '../../utils/eventUtils';
import { configureStore, renderWithProviders, mockedSingleEvent, mockedRecurringEvent } from '../../utils/testUtils';
import CloseMeetingDialog, { CloseMeetingDialogProps } from './CloseMeetingDialog';

const TEST_DATE = '2024-02-16T10:30:00Z';
const VERIFY_TODAY_DATE = '20240216T103000Z';

const mockRefetch = jest.fn();

const dialogProps: CloseMeetingDialogProps = {
  open: true,
  onClose: jest.fn(),
  container: null,
};

describe('generate instance id', () => {
  it('should generate an instance id with the date of test date', () => {
    const startTimeInEventFormat = new Date(TEST_DATE);

    const instanceId = generateInstanceId({
      datetime: startTimeInEventFormat.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    expect(instanceId).toEqual(VERIFY_TODAY_DATE);
    jest.useRealTimers();
  });
});

describe('CloseMeetingDialog', () => {
  const { store } = configureStore();

  it('should not render with open={false}', () => {
    jest.spyOn(restAPI, 'useGetEventQuery').mockReturnValue({ refetch: mockRefetch });
    renderWithProviders(<CloseMeetingDialog {...dialogProps} open={false} />, {
      store,
      provider: { router: true, snackbar: true },
    });
    expect(screen.queryByText('meeting-delete-metadata-dialog-title')).not.toBeInTheDocument();
    expect(screen.queryByText('meeting-delete-metadata-dialog-message')).not.toBeInTheDocument();
    expect(screen.queryByText('meeting-delete-metadata-dialog-checkbox')).not.toBeInTheDocument();
    expect(screen.queryByText('meeting-delete-metadata-button-leave-and-delete')).not.toBeInTheDocument();
    expect(screen.queryByText('meeting-delete-metadata-button-leave-without-delete')).not.toBeInTheDocument();
  });

  it('should render properly for single events', async () => {
    jest.spyOn(restAPI, 'useGetEventQuery').mockReturnValue({ data: mockedSingleEvent, refetch: mockRefetch });
    renderWithProviders(<CloseMeetingDialog {...dialogProps} />, {
      store,
      provider: { router: true, snackbar: true },
    });
    expect(await screen.findByText('meeting-delete-metadata-dialog-title')).toBeInTheDocument();
    expect(screen.getByText('meeting-delete-metadata-dialog-message')).toBeInTheDocument();
    expect(screen.getByText('meeting-delete-metadata-dialog-checkbox')).toBeInTheDocument();
    expect(screen.getByText('meeting-delete-metadata-button-leave-and-delete')).toBeInTheDocument();
    expect(screen.getByText('meeting-delete-metadata-button-leave-without-delete')).toBeInTheDocument();
  });

  it('should render properly for recurring events', async () => {
    jest.spyOn(restAPI, 'useGetEventQuery').mockReturnValue({ data: mockedRecurringEvent, refetch: mockRefetch });
    renderWithProviders(<CloseMeetingDialog {...dialogProps} />, {
      store,
      provider: { router: true, snackbar: true },
    });
    expect(await screen.findByText('meeting-delete-metadata-dialog-title')).toBeInTheDocument();
    expect(screen.getByText('meeting-delete-recurring-metadata-dialog-message')).toBeInTheDocument();
    expect(screen.getByText('meeting-delete-recurring-dialog-radio-single')).toBeInTheDocument();
    expect(screen.getByText('meeting-delete-recurring-dialog-radio-all')).toBeInTheDocument();
    expect(screen.getByText('meeting-delete-metadata-button-leave-and-delete')).toBeInTheDocument();
    expect(screen.getByText('meeting-delete-metadata-button-leave-without-delete')).toBeInTheDocument();
  });
});
