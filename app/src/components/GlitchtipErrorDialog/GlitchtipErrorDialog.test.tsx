// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ErrorEvent } from '@sentry/react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mock, MockInstance } from 'vitest';

import { useAppSelector } from '../../hooks';
import { setShowErrorDialog } from '../../store/slices/uiSlice';
import { DELAY_BETWEEN_EVENT_AND_REPORT_MS } from '../../utils/glitchtipUtils';
import { renderWithProviders } from '../../utils/testUtils';
import { sleep } from '../../utils/timeUtils';
import GlitchtipErrorDialog from './GlitchtipErrorDialog';

const mockDispatch = vi.fn();

vi.mock('../../hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: () => mockDispatch,
}));

vi.mock('../../utils/timeUtils', async () => {
  const actual = await vi.importActual<typeof import('../../utils/timeUtils')>('../../utils/timeUtils');
  return {
    ...actual,
    sleep: vi.fn().mockResolvedValue(undefined),
  };
});

type GlitchtipState = {
  ui: {
    errorDialog: {
      showErrorDialog: boolean;
      event?: ErrorEvent;
    };
  };
  config: {
    glitchtip?: {
      dsn?: string;
    };
  };
};

const glitchtipDsn = 'https://public@sentry.example.com/1';

const mockEvent = {
  event_id: 'event-123',
  sent_at: '2025-12-05T10:00:00Z',
  exception: {
    values: [
      {
        type: 'Error',
        value: 'Unexpected crash',
        stacktrace: {
          frames: [
            {
              filename: 'App.tsx',
              function: 'render',
              lineno: 42,
              colno: 13,
            },
          ],
        },
      },
    ],
  },
} as Partial<ErrorEvent>;

const configureSelectors = (state: GlitchtipState) => {
  (useAppSelector as unknown as Mock).mockImplementation((selector: (s: GlitchtipState) => unknown) =>
    selector(state as never)
  );
};

const renderDialog = () =>
  renderWithProviders(<GlitchtipErrorDialog />, {
    provider: { mui: true },
  });

const getGlitchtipCalls = (mock: MockInstance) =>
  mock.mock.calls.filter(([url]) => typeof url === 'string' && /\/(envelope|error-page)\//.test(url as string));

const findCallIndex = (mock: MockInstance, substring: string) =>
  mock.mock.calls.findIndex(([url]) => typeof url === 'string' && (url as string).includes(substring));

describe('GlitchtipErrorDialog', () => {
  let fetchMock: MockInstance;

  beforeAll(() => {
    vi.stubGlobal('__SENTRY_VERSION__', '9.0.0');
  });

  beforeEach(() => {
    vi.resetAllMocks();
    fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(new Response());
  });

  it('returns null when error reporting is disabled', () => {
    configureSelectors({
      ui: { errorDialog: { showErrorDialog: true, event: mockEvent as ErrorEvent } },
      config: { glitchtip: { dsn: undefined } },
    });

    renderDialog();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog with error information when configured', () => {
    configureSelectors({
      ui: { errorDialog: { showErrorDialog: true, event: mockEvent as ErrorEvent } },
      config: { glitchtip: { dsn: glitchtipDsn } },
    });

    renderDialog();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('glitchtip-crash-report-title')).toBeInTheDocument();
    expect(screen.getByText('Unexpected crash')).toBeInTheDocument();
    expect(screen.getByText('App.tsx in render at line 42:13')).toBeInTheDocument();
  });

  it('dispatches close action when the dialog close button is clicked', async () => {
    configureSelectors({
      ui: { errorDialog: { showErrorDialog: true, event: mockEvent as ErrorEvent } },
      config: { glitchtip: { dsn: glitchtipDsn } },
    });

    renderDialog();

    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByRole('button', { name: 'global-close-dialog' }));

    expect(mockDispatch).toHaveBeenCalledWith(setShowErrorDialog({ showErrorDialog: false, event: undefined }));
  });

  it('validates feedback fields when only part of the form is filled', async () => {
    configureSelectors({
      ui: { errorDialog: { showErrorDialog: true, event: mockEvent as ErrorEvent } },
      config: { glitchtip: { dsn: glitchtipDsn } },
    });

    renderDialog();

    const user = userEvent.setup({ delay: null });
    await user.type(screen.getByLabelText('glitchtip-crash-report-labelName'), 'John Doe');
    await user.click(screen.getByRole('button', { name: 'glitchtip-crash-report-labelSubmit' }));

    expect(getGlitchtipCalls(fetchMock)).toHaveLength(0);
    expect(await screen.findAllByText('global-error: field-error-required')).toHaveLength(2);
  });

  it('sends event and feedback then shows success content', async () => {
    configureSelectors({
      ui: { errorDialog: { showErrorDialog: true, event: mockEvent as ErrorEvent } },
      config: { glitchtip: { dsn: glitchtipDsn } },
    });

    renderDialog();

    const user = userEvent.setup({ delay: null });
    await user.type(screen.getByLabelText('glitchtip-crash-report-labelName'), 'Jane Doe');
    await user.type(screen.getByLabelText('glitchtip-crash-report-labelEmail'), 'jane@example.com');
    await user.type(screen.getByLabelText('glitchtip-crash-report-labelComments'), 'It crashed');
    await user.click(screen.getByRole('button', { name: 'glitchtip-crash-report-labelSubmit' }));

    await waitFor(() => {
      expect(findCallIndex(fetchMock, '/envelope/')).toBeGreaterThanOrEqual(0);
      expect(findCallIndex(fetchMock, '/error-page/')).toBeGreaterThanOrEqual(0);
    });

    const envelopeIndex = findCallIndex(fetchMock, '/envelope/');
    const reportIndex = findCallIndex(fetchMock, '/error-page/');

    expect(envelopeIndex).toBeLessThan(reportIndex);
    expect(sleep).toHaveBeenCalledWith(DELAY_BETWEEN_EVENT_AND_REPORT_MS);
    expect(await screen.findByText('glitchtip-crash-report-send-successful-title')).toBeInTheDocument();
    expect(screen.getByText('glitchtip-crash-report-successMessage')).toBeInTheDocument();
  });
});
