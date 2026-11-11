// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';

import { TranscriptionLanguage } from '../../../api/types/incoming/transcription';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import TranscriptionLanguageSelect from './TranscriptionLanguageSelect';

const renderSelect = (props: Partial<ComponentProps<typeof TranscriptionLanguageSelect>> = {}) => {
  const onChange = vi.fn();
  const { store } = configureStore();
  renderWithProviders(<TranscriptionLanguageSelect value="" onChange={onChange} {...props} />, {
    store,
    provider: { mui: true },
  });

  return { onChange };
};

describe('TranscriptionLanguageSelect', () => {
  it('renders the label', () => {
    renderSelect();
    expect(screen.getByText('transcription-language-select-label')).toBeInTheDocument();
  });

  it('shows a placeholder when no language is selected', () => {
    renderSelect({ value: '' });
    expect(screen.getByRole('combobox')).toHaveTextContent('transcription-language-select-placeholder');
  });

  it('shows the name of the selected language', () => {
    renderSelect({ value: 'de' });
    expect(screen.getByRole('combobox')).toHaveTextContent('Deutsch');
  });

  it('lists all transcription languages as options', async () => {
    const user = userEvent.setup();
    renderSelect();

    await user.click(screen.getByRole('combobox'));
    const options = within(await screen.findByRole('listbox')).getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual(Object.values(TranscriptionLanguage));
  });

  it('calls onChange with the language key when an option is selected', async () => {
    const user = userEvent.setup();
    const { onChange } = renderSelect({ value: 'en' });

    await user.click(screen.getByRole('combobox'));
    await user.click(within(await screen.findByRole('listbox')).getByRole('option', { name: 'Deutsch' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('de');
  });

  it('cannot be opened when disabled', async () => {
    const user = userEvent.setup();
    const { onChange } = renderSelect({ value: 'en', disabled: true });

    const languageSelect = screen.getByRole('combobox');
    expect(languageSelect).toHaveAttribute('aria-disabled', 'true');

    await user.click(languageSelect);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows the hint and uses it as the accessible description of the select', () => {
    renderSelect({ hint: 'language-hint' });
    expect(screen.getByText('language-hint')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAccessibleDescription('language-hint');
  });

  it('has no accessible description when no hint is given', () => {
    renderSelect();
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-describedby');
  });
});
