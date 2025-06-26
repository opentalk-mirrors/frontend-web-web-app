// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RecurrencePattern } from '@opentalk/rest-api-rtk-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { Formik } from 'formik';

import { TrainingParticipationReportSelect } from './TrainingParticipationReportSelect';

const initialValues = {
  trainingParticipationReport: {
    enabled: true,
  },
  waitingRoom: false,
  isTimeDependent: false,
  startDate: '',
  endDate: '',
  recurrencePattern: '' as RecurrencePattern,
  sharedFolder: false,
  streaming: {
    enabled: false,
  },
  showMeetingDetails: false,
  e2eEncryption: false,
};

describe('Training participation report select', () => {
  it('Select is not rendered when not enabled', async () => {
    render(
      <Formik initialValues={{ ...initialValues, trainingParticipationReport: { enabled: false } }} onSubmit={() => {}}>
        {(formikProps) => <TrainingParticipationReportSelect formik={formikProps} />}
      </Formik>
    );

    const selectButton = screen.queryByRole('combobox');
    expect(selectButton).not.toBeInTheDocument();
  });

  it('Select is rendered and usable when enabled', async () => {
    render(
      <Formik initialValues={initialValues} onSubmit={() => {}}>
        {(formikProps) => <TrainingParticipationReportSelect formik={formikProps} />}
      </Formik>
    );

    const selectButton = await screen.findByRole('combobox');
    expect(selectButton).toBeInTheDocument();

    selectButton && fireEvent.mouseDown(selectButton);

    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();

    const sixtyMinOption = screen.getByRole('option', {
      name: 'dashboard-meeting-training-participation-report-option-every-sixty-min',
    });

    fireEvent.click(sixtyMinOption);

    const select = await screen.findByTestId('parameter-select');
    const fixedSelect = select.textContent?.replace(/\u200B/g, '');
    expect(fixedSelect).toBe('dashboard-meeting-training-participation-report-option-every-sixty-min');
  });
});
