// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent, waitFor, cleanup } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../utils/testUtils';
import WizardForm from './WizardForm';

describe('Testing wizzard form', () => {
  const mockStep1Component = () => <div>Step 1</div>;
  const mockStep2Component = () => <div>Step 2</div>;
  const steps = [{ component: mockStep1Component }, { component: mockStep2Component }];
  const onSubmit = jest.fn();
  const initialValues = { firstName: '', email: '', designation: '' };

  afterAll(() => cleanup());
  const { store } = configureStore();
  test('should render without crashing', () => {
    renderWithProviders(<WizardForm steps={steps} onSubmit={onSubmit} initialValues={initialValues} />, { store });

    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  test('on next button click should move to next step', async () => {
    renderWithProviders(<WizardForm steps={steps} onSubmit={onSubmit} initialValues={initialValues} />, { store });
    const nextButton = screen.getByRole('button', { name: /next/i });

    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();

    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Step 2')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });
  });

  test('on back button click should move to previous step', async () => {
    renderWithProviders(<WizardForm steps={steps} onSubmit={onSubmit} initialValues={initialValues} />, { store });
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();

    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /back/i }));

    await waitFor(() => {
      expect(screen.getByText('Step 1')).toBeInTheDocument();
    });
  });

  test('on click on submit button should fire onSubmit()', async () => {
    const lastStep = [{ component: mockStep2Component }];
    renderWithProviders(<WizardForm steps={lastStep} onSubmit={onSubmit} initialValues={initialValues} />, { store });

    expect(screen.getByText('Step 2')).toBeInTheDocument();

    const submitButton = screen.getByRole('button', { name: /submit/i });

    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
