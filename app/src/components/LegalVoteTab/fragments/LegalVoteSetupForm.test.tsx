// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import { describe, it, expect, vi } from 'vitest';

import { LegalVoteKind, LegalVoteFormValues } from '../../../types';
import { renderWithProviders } from '../../../utils/testUtils';
import { LegalVoteSetupForm } from './LegalVoteSetupForm';

const t = (key: string) => key;

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

    renderWithProviders(
      <Formik initialValues={initialValues} onSubmit={() => {}}>
        {(formik) => <LegalVoteSetupForm formik={formik} t={t} onSave={() => handleSave(formik.values)} />}
      </Formik>,
      { provider: { mui: true } }
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
