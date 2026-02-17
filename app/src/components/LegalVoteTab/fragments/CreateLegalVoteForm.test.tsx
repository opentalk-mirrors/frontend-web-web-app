// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { start } from '../../../api/types/outgoing/legalVote';
import { notifications } from '../../../commonComponents';
import { savedLegalVoteForm } from '../../../store/slices/legalVoteSlice';
import { LegalVoteFormValues, LegalVoteKind, ParticipantId, SavedLegalVoteForm } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import CreateLegalVoteForm from './CreateLegalVoteForm';
import { AllowedParticipant } from './ParticipantSelector';

vi.mock('../../../commonComponents', async (importOriginal) => ({
  ...(await importOriginal()),
  notifications: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('../../../api/types/outgoing/common', async (importOriginal) => ({
  ...(await importOriginal()),
  sendMessage: vi.fn(),
}));

vi.mock('../../../utils/timeFormatUtils', async (importOriginal) => ({
  ...(await importOriginal()),
  getCurrentTimezone: vi.fn(() => 'Mock/Zone'),
}));

type LegalVoteFormWithParticipants = SavedLegalVoteForm &
  LegalVoteFormValues & {
    allowedParticipants: AllowedParticipant[];
  };

const buildInitialValues = (overrides: Partial<LegalVoteFormWithParticipants> = {}): LegalVoteFormWithParticipants => ({
  duration: 1,
  enableAbstain: true,
  autoClose: false,
  name: '',
  topic: '',
  allowedParticipants: [],
  subtitle: '',
  createPdf: true,
  kind: LegalVoteKind.RollCall,
  ...overrides,
});

describe('CreateLegalVoteForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows update header when editing a saved legal vote', () => {
    const { store } = configureStore();

    renderWithProviders(
      <CreateLegalVoteForm
        initialValues={buildInitialValues({ id: 2 })}
        onClose={vi.fn()}
        isCoffeeBreakActive={false}
      />,
      { store, provider: { mui: true } }
    );

    expect(screen.getByText('legal-vote-header-title-update')).toBeInTheDocument();
  });

  it('shows an error notification when saving without name or topic', async () => {
    const { store, dispatchSpy } = configureStore();
    const user = userEvent.setup();

    renderWithProviders(
      <CreateLegalVoteForm initialValues={buildInitialValues()} onClose={vi.fn()} isCoffeeBreakActive={false} />,
      { store, provider: { mui: true } }
    );

    await user.click(screen.getByRole('button', { name: 'save-as-template-button' }));

    expect(notifications.error).toHaveBeenCalledExactlyOnceWith('legal-vote-save-form-error');
    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({ type: savedLegalVoteForm.type }));
  });

  it('saves form values and notifies when save is clicked with valid inputs', async () => {
    const { store, dispatchSpy } = configureStore();
    const user = userEvent.setup();

    renderWithProviders(
      <CreateLegalVoteForm initialValues={buildInitialValues()} onClose={vi.fn()} isCoffeeBreakActive={false} />,
      { store, provider: { mui: true } }
    );

    await user.type(screen.getByPlaceholderText('legal-vote-title-placeholder'), 'Annual vote');
    await user.type(screen.getByPlaceholderText('legal-vote-topic-placeholder'), 'Approve budget');
    await user.click(screen.getByRole('button', { name: 'save-as-template-button' }));

    expect(dispatchSpy).toHaveBeenCalledWith(
      savedLegalVoteForm(
        expect.objectContaining({
          id: 0,
          name: 'Annual vote',
          topic: 'Approve budget',
        })
      )
    );
    expect(notifications.success).toHaveBeenCalledExactlyOnceWith('legal-vote-save-form-success');
  });

  it('submits the start action and closes after completing both steps', async () => {
    const allowedParticipants: AllowedParticipant[] = [
      { id: 'participant-1' as ParticipantId, displayName: 'One' },
      { id: 'participant-2' as ParticipantId, displayName: 'Two' },
    ];
    const initialValues = buildInitialValues({
      name: 'Board Vote',
      topic: 'Approve minutes',
      allowedParticipants,
      duration: 2,
      enableAbstain: false,
      autoClose: true,
      createPdf: false,
    });
    const { store, dispatchSpy } = configureStore();
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithProviders(
      <CreateLegalVoteForm initialValues={initialValues} onClose={onClose} isCoffeeBreakActive={false} />,
      { store, provider: { mui: true } }
    );

    await user.click(screen.getByRole('button', { name: 'legal-vote-form-button-continue' }));
    await screen.findByRole('button', { name: 'poll-participant-list-button-start' });
    await user.click(screen.getByRole('button', { name: 'poll-participant-list-button-start' }));

    const expectedPayload = {
      name: 'Board Vote',
      subtitle: undefined,
      topic: 'Approve minutes',
      enableAbstain: false,
      autoClose: true,
      duration: 120,
      allowedParticipants: allowedParticipants.map((participant) => participant.id),
      createPdf: false,
      kind: LegalVoteKind.RollCall,
      timezone: 'Mock/Zone',
    };

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(start.action(expectedPayload));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables advancing while coffee break is active', () => {
    const { store } = configureStore();

    renderWithProviders(
      <CreateLegalVoteForm initialValues={buildInitialValues()} onClose={vi.fn()} isCoffeeBreakActive={true} />,
      { store, provider: { mui: true } }
    );

    expect(screen.getByRole('button', { name: 'legal-vote-form-button-continue' })).toBeDisabled();
  });
});
