// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuList } from '@mui/material';
import { BackendModules } from '@opentalk/rest-api-rtk-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { generateAttendanceReport } from '../../../api/types/outgoing/meetingReport';
import { Role } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import AttendanceReportMenuItem from './AttendanceReportMenuItem';

const renderAttendanceReportMenuItem = (moduleEnabled: boolean) => {
  const { store, dispatchSpy } = configureStore({
    initialState: {
      user: { role: Role.Moderator },
      config: {
        provider: { accountManagementUrl: 'https://account.opentalk.eu' },
        enabledModules: moduleEnabled ? { [BackendModules.MeetingReport]: [] } : {},
      },
    },
  });

  renderWithProviders(
    <MenuList>
      <AttendanceReportMenuItem onClose={vi.fn()} />
    </MenuList>,
    { store, provider: { mui: true, snackbar: true } }
  );

  return { dispatchSpy };
};

describe('AttendanceReportMenuItem', () => {
  it('does not render when the meeting report module is disabled', () => {
    renderAttendanceReportMenuItem(false);

    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });

  it('renders and dispatches the report action when enabled', async () => {
    const user = userEvent.setup();
    const { dispatchSpy } = renderAttendanceReportMenuItem(true);

    await user.click(screen.getByRole('menuitem', { name: 'more-menu-export-attendance-report' }));

    expect(dispatchSpy).toHaveBeenCalledWith(generateAttendanceReport.action({ includeEmailAddresses: false }));
  });
});
