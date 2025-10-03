// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { mockStore, renderWithProviders } from '../../../utils/testUtils';
import { Seconds } from '../../../utils/tsUtils';
import CreateRoomsForm from './CreateRoomsForm';

vi.mock('formik', async () => {
  const actual = await vi.importActual<typeof import('formik')>('formik');
  return {
    ...actual,
    useFormik: (config: {
      initialValues: Record<string, unknown>;
      onSubmit: (values: Record<string, unknown>, helpers: { setSubmitting: (v: boolean) => void }) => void;
    }) => {
      const values: Record<string, unknown> = { ...config.initialValues, distribution: true };
      return {
        values,
        errors: {},
        isSubmitting: false,
        handleSubmit: () => config.onSubmit(values, { setSubmitting: () => {} }),
        setFieldValue: (field: string, value: unknown) => {
          values[field] = value;
        },
      };
    },
  };
});

describe('CreateRoomForm', () => {
  it('renders the form correctly', async () => {
    const { store } = mockStore(4);

    renderWithProviders(<CreateRoomsForm />, { store, provider: { mui: true } });

    expect(
      await screen.findByRole('button', { name: 'global-duration field-duration-unlimited-time' })
    ).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'breakout-room-start-button' })).toBeInTheDocument();
  });

  it('starts breakout room with 5 minutes duration should send 300sec to backend', async () => {
    const { store, dispatchSpy } = mockStore(4, { store: { breakout: { active: false } } });

    renderWithProviders(<CreateRoomsForm />, { store, provider: { mui: true, snackbar: true } });

    fireEvent.click(await screen.findByRole('button', { name: 'global-duration field-duration-unlimited-time' }));
    fireEvent.click(await screen.findByRole('button', { name: '5 global-minute' }));
    fireEvent.click(await screen.findByRole('button', { name: 'field-duration-button-save' }));
    fireEvent.click(await screen.findByRole('button', { name: 'breakout-room-start-button' }));

    const duration = (5 * 60) as Seconds;
    await waitFor(() =>
      expect(dispatchSpy).toHaveBeenCalledWith({
        type: 'signaling/breakout/start',
        payload: { duration: duration, strategy: 'manual', rooms: expect.any(Array) },
      })
    );
  });
});
