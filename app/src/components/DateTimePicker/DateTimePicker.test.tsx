// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import DateFnsAdapter from '@date-io/date-fns';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders, configureStore } from '../../utils/testUtils';
import DateTimePicker from './DateTimePicker';

const date = new Date();
const dateFns = new DateFnsAdapter();

const dateTimePickerProps = {
  ampm: false,
  value: date.toString(),
  onChange: jest.fn(),
};

const clearableDateTimePickerProps = {
  value: date.toString(),
  clearable: true,
  clearButtonLabel: 'Custom clear button text',
  placeholder: 'Cleared value',
  onChange: jest.fn(),
  ampm: false,
};

describe('render <DateTimePicker />', () => {
  const { store } = configureStore();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders DateTimePicker component with german localization', async () => {
    // eslint disabled is needed because of recursion type definitions inside the library
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    jest.spyOn(require('react-i18next'), 'useTranslation').mockReturnValue({
      t: (i18nKey: string) => i18nKey,
      i18n: {
        language: {
          split: () => ['de'],
        },
      },
    });

    renderWithProviders(<DateTimePicker {...dateTimePickerProps} />, { store, provider: { mui: true } });
    const input: HTMLInputElement = screen.getByRole('textbox');
    const deFormattedDate = dateFns.formatByString(date, 'dd.MM.yyyy HH:mm');

    expect(input.value).toBe(deFormattedDate);
  });

  it('renders DateTimePicker placeholder value on clear button click', async () => {
    renderWithProviders(<DateTimePicker {...clearableDateTimePickerProps} />, { store, provider: { mui: true } });

    const input: HTMLInputElement = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();

    const chooseDateButton = screen.getByRole('button', { name: /choose date/i });
    expect(chooseDateButton).toBeInTheDocument();

    await userEvent.click(chooseDateButton);

    const clearButton = screen.getByRole('button', { name: clearableDateTimePickerProps.clearButtonLabel });
    expect(clearButton).toBeInTheDocument();
  });
});
