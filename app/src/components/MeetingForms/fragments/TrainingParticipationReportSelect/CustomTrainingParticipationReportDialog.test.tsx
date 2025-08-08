// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

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
    render(<CustomTrainingParticipationReportDialog {...mockDialogProps} />);

    expect(screen.getByTestId('custom-training-participation-report-dialog')).toBeInTheDocument();
  });
});
