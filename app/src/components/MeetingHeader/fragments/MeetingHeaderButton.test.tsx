// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { renderWithProviders } from '../../../utils/testUtils';
import { MeetingHeaderButton } from './MeetingHeaderButton';

describe('MeetingHeaderButton', () => {
  it('should render without crashing', () => {
    expect(() => renderWithProviders(<MeetingHeaderButton />, { provider: { mui: true } })).not.toThrow();
    expect(() => renderWithProviders(<MeetingHeaderButton active />, { provider: { mui: true } })).not.toThrow();
  });
});
