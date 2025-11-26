// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FormikProps } from 'formik';
import { ChangeEvent, useState } from 'react';
import { describe, it, expect, vi } from 'vitest';

import { LegalVoteKind, LegalVoteFormValues } from '../../../types';
import { LegalVoteSetupForm } from './LegalVoteSetupForm';

const t = (key: string) => key;
const theme = createTheme();

describe('LegalVoteSetupForm', () => {
  const initialValues: LegalVoteFormValues = {
    kind: LegalVoteKind.RollCall,
    name: '',
    subtitle: '',
    topic: '',
    enableAbstain: false,
    autoClose: false,
    duration: 1,
    createPdf: false,
  };

  it('renders fields and fires onSave when save button clicked', async () => {
    const handleSave = vi.fn();
    const TestWrapper = () => {
      const [values, setValues] = useState<LegalVoteFormValues>(initialValues);

      const setFieldValue = (field: keyof LegalVoteFormValues, value: LegalVoteFormValues[keyof LegalVoteFormValues]) =>
        setValues((prev) => ({ ...prev, [field]: value }));

      const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = event.target;
        setValues((prev) => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value,
        }));
      };

      const formik = {
        values,
        errors: {},
        initialValues,
        handleChange,
        handleBlur: vi.fn(),
        setFieldValue,
      } as unknown as FormikProps<LegalVoteFormValues>;

      return <LegalVoteSetupForm formik={formik} t={t} onSave={() => handleSave(formik.values)} />;
    };

    render(
      <ThemeProvider theme={theme}>
        <TestWrapper />
      </ThemeProvider>
    );

    expect(screen.getByText('legal-vote-form-allow-abstain')).toBeInTheDocument();
    expect(screen.getByText('legal-vote-form-auto-stop')).toBeInTheDocument();
    expect(screen.getByText('global-duration')).toBeInTheDocument();

    const kindSelect = screen.getByRole('combobox');
    expect(kindSelect).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('legal-vote-title-placeholder');
    expect(nameInput).toBeInTheDocument();
    await userEvent.type(nameInput, 'My Legal Vote');

    const subtitleInput = screen.getByPlaceholderText('legal-vote-subtitle-placeholder');
    await userEvent.type(subtitleInput, 'Optional subtitle');

    const topicInput = screen.getByPlaceholderText('legal-vote-topic-placeholder');
    await userEvent.type(topicInput, 'Topic body');

    const saveButton = screen.getByRole('button', { name: 'legal-vote-form-button-save' });
    await userEvent.click(saveButton);
    expect(handleSave).toHaveBeenCalledExactlyOnceWith({
      kind: LegalVoteKind.RollCall,
      name: 'My Legal Vote',
      subtitle: 'Optional subtitle',
      topic: 'Topic body',
      enableAbstain: false,
      autoClose: false,
      duration: 1,
      createPdf: false,
    });
  });
});
