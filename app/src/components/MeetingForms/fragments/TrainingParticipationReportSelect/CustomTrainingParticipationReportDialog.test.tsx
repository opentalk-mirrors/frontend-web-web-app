// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../../../utils/testUtils';
import {
  CustomTrainingParticipationReportDialog,
  CustomTrainingParticipationReportDialogProps,
} from './CustomTrainingParticipationReportDialog';

const mockDialogProps: CustomTrainingParticipationReportDialogProps = {
  closeDialog: vi.fn(),
  saveOption: vi.fn(),
  previousOption: {
    initialCheckpointDelay: { after: 60, within: 60 },
    checkpointInterval: { after: 120, within: 120 },
  },
};

describe('Custom Recurrence Dialog', () => {
  it('Dialog renders correctly', () => {
    renderWithProviders(<CustomTrainingParticipationReportDialog {...mockDialogProps} />, { provider: { mui: true } });

    expect(screen.getByTestId('custom-training-participation-report-dialog')).toBeInTheDocument();
  });
});
