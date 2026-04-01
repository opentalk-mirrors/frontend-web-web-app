// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { CoreFeatures, InviteCode, SipId } from '@opentalk/rest-api-rtk-query';
import { MeetingDetails } from '@opentalk/rest-api-rtk-query/src/types/event';
import { screen, fireEvent } from '@testing-library/react';
import { Mock } from 'vitest';

import type { RootState } from '../../../store';
import { renderWithProviders, configureStore } from '../../../utils/testUtils';
import type { DeepPartial } from '../../../utils/tsUtils';
import MeetingDetailsDialogActions, { MeetingDetailsDialogActionsProps } from './MeetingDetailsDialogActions';

vi.mock('../../../commonComponents', async (importOriginal) => ({
  ...(await importOriginal()),
  notifications: {
    success: vi.fn(),
  },
}));

const DEFAULT_TITLE = 'Test Meeting';
const DEFAULT_PASSWORD = 'Password123';
const DEFAULT_CALL_IN_ID = '123456' as SipId;
const DEFAULT_CALL_IN_TEL = '+1234567890';
const DEFAULT_CALL_IN_PASSWORD = 'Password456';
const defaultMeeingDetails: MeetingDetails = {
  inviteCodeId: '12345' as InviteCode,
  callIn: {
    id: DEFAULT_CALL_IN_ID,
    tel: DEFAULT_CALL_IN_TEL,
    password: DEFAULT_CALL_IN_PASSWORD,
  },
  streamingLinks: [
    {
      name: 'Test Stream',
      url: 'https://example.com/stream',
    },
  ],
};
const mockInviteUrl = new URL('https://example.com/meeting');

describe('message creation', () => {
  let clipboardWriteTextOriginal: Clipboard['writeText'];
  beforeEach(() => {
    clipboardWriteTextOriginal = navigator.clipboard?.writeText?.bind(navigator.clipboard);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: clipboardWriteTextOriginal,
      },
    });
  });

  describe('rendering', () => {
    const { store } = configureStore({});

    it('renders all buttons', async () => {
      renderWithProviders(<MeetingDetailsDialogActions title={DEFAULT_TITLE} roomPassword={DEFAULT_PASSWORD} />, {
        store,
      });
      expect(await screen.findByRole('button', { name: 'meeting-details-dialog-copy-button' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'meeting-details-dialog-mail-button' })).toBeInTheDocument();
    });

    it("writes content to the clipboard when 'Copy' button is clicked", async () => {
      (navigator.clipboard.writeText as Mock).mockResolvedValueOnce(undefined);

      renderWithProviders(<MeetingDetailsDialogActions title={DEFAULT_TITLE} roomPassword={DEFAULT_PASSWORD} />, {
        store,
      });

      const copyButton = await screen.findByText('meeting-details-dialog-copy-button');
      fireEvent.click(copyButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  describe('message content', () => {
    const defaultInitialState: DeepPartial<RootState> = {
      config: {
        baseUrl: 'http://localhost:3000',
        tariff: {
          disabledFeatures: [],
        },
      },
    };

    const defaultProps: MeetingDetailsDialogActionsProps = {
      title: DEFAULT_TITLE,
      roomPassword: DEFAULT_PASSWORD,
      meetingDetails: defaultMeeingDetails,
      inviteUrl: mockInviteUrl,
    };

    const setup = async (
      customInitialState?: DeepPartial<RootState>,
      customProps?: MeetingDetailsDialogActionsProps
    ) => {
      (navigator.clipboard.writeText as Mock).mockResolvedValueOnce(undefined);

      const initialState = customInitialState ? customInitialState : defaultInitialState;
      const { store } = configureStore({ initialState });

      const props = customProps ? customProps : defaultProps;
      renderWithProviders(<MeetingDetailsDialogActions {...props} />, {
        store,
      });

      const copyButton = await screen.findByText('meeting-details-dialog-copy-button');
      fireEvent.click(copyButton);

      const clipboardArg = (navigator.clipboard.writeText as Mock).mock.calls[0][0];
      return clipboardArg;
    };

    it('contains meeting title', async () => {
      const clipboardArg = await setup();
      expect(clipboardArg).toContain(`global-title`);
      expect(clipboardArg).toContain(DEFAULT_TITLE);
    });

    describe('participation means section', () => {
      it('prints "you can join..." if guests are allowed, invite link is provided, call-in and streaming exist', async () => {
        const clipboardArg = await setup();
        expect(clipboardArg).toContain(`meeting-details-dialog-join-line`);
        expect(clipboardArg).not.toContain(`meeting-details-dialog-join-prohibited-line`);
      });
      it('prints "you can join..." if guests are allowed, invite link is provided, call-in exists and streaming does not exist', async () => {
        const clipboardArg = await setup(defaultInitialState, {
          ...defaultProps,
          meetingDetails: {
            ...defaultMeeingDetails,
            streamingLinks: [],
          },
        });
        expect(clipboardArg).toContain(`meeting-details-dialog-join-line`);
        expect(clipboardArg).not.toContain(`meeting-details-dialog-join-prohibited-line`);
      });
      it('prints "you can join..." if guests are allowed, invite link is provided, call-in does not exist and streaming exists', async () => {
        const clipboardArg = await setup(defaultInitialState, {
          ...defaultProps,
          meetingDetails: {
            ...defaultMeeingDetails,
            callIn: undefined,
          },
        });
        expect(clipboardArg).toContain(`meeting-details-dialog-join-line`);
        expect(clipboardArg).not.toContain(`meeting-details-dialog-join-prohibited-line`);
      });
      it('prints "guest access prohibited..." if guests are not allowed, invite link is provided, call-in and streaming do not exist', async () => {
        const clipboardArg = await setup(
          {
            ...defaultInitialState,
            config: { tariff: { disabledFeatures: [CoreFeatures.GuestsAllowed] } },
          },
          {
            ...defaultProps,
            meetingDetails: {
              ...defaultMeeingDetails,
              callIn: undefined,
              streamingLinks: [],
            },
          }
        );
        expect(clipboardArg).not.toContain(`meeting-details-dialog-join-line`);
        expect(clipboardArg).toContain(`meeting-details-dialog-join-prohibited-line`);
      });
      it('prints "guest access prohibited..." if guests are allowed, invite link is not provided, call-in and streaming do not exist', async () => {
        const clipboardArg = await setup(defaultInitialState, {
          ...defaultProps,
          inviteUrl: undefined,
          meetingDetails: {
            ...defaultMeeingDetails,
            callIn: undefined,
            streamingLinks: [],
          },
        });
        expect(clipboardArg).not.toContain(`meeting-details-dialog-join-line`);
        expect(clipboardArg).toContain(`meeting-details-dialog-join-prohibited-line`);
      });
      it('prints "guest access prohibited..." if guests are not allowed, invite link is not provided, call-in and streaming do not exist', async () => {
        const clipboardArg = await setup(
          {
            ...defaultInitialState,
            config: { tariff: { disabledFeatures: [CoreFeatures.GuestsAllowed] } },
          },
          {
            ...defaultProps,
            meetingDetails: {
              ...defaultMeeingDetails,
              callIn: undefined,
              streamingLinks: [],
            },
            inviteUrl: undefined,
          }
        );
        expect(clipboardArg).not.toContain(`meeting-details-dialog-join-line`);
        expect(clipboardArg).toContain(`meeting-details-dialog-join-prohibited-line`);
      });
    });

    describe('invite link', () => {
      it('is printed if guests are allowed and invite link is provided', async () => {
        const clipboardArg = await setup();
        expect(clipboardArg).toContain(`global-meeting-link`);
        expect(clipboardArg).toContain(mockInviteUrl.toString());
      });
      it('is not printed if guests are not allowed and invite link is provided', async () => {
        const clipboardArg = await setup({
          ...defaultInitialState,
          config: { tariff: { disabledFeatures: [CoreFeatures.GuestsAllowed] } },
        });
        expect(clipboardArg).not.toContain(`global-meeting-link`);
        expect(clipboardArg).not.toContain(mockInviteUrl.toString());
      });
      it('is not printed if guests are allowed and no invite link is provided', async () => {
        const clipboardArg = await setup(defaultInitialState, {
          ...defaultProps,
          inviteUrl: undefined,
        });
        expect(clipboardArg).not.toContain(`global-meeting-link`);
        expect(clipboardArg).not.toContain(mockInviteUrl.toString());
      });
    });

    describe('password', () => {
      it('is printed if guests are allowed, invite link is provided and password is provided', async () => {
        const clipboardArg = await setup();
        expect(clipboardArg).toContain(`global-password`);
        expect(clipboardArg).toContain(DEFAULT_PASSWORD);
      });
      it('is not printed if guests are allowed, invite link is provided and empty password is provided', async () => {
        const clipboardArg = await setup(defaultInitialState, {
          ...defaultProps,
          roomPassword: '',
        });
        expect(clipboardArg).not.toContain(`global-password`);
        expect(clipboardArg).not.toContain(DEFAULT_PASSWORD);
      });
      it('is not printed if guests are not allowed, invite link is provided and password is provided', async () => {
        const clipboardArg = await setup({
          ...defaultInitialState,
          config: { tariff: { disabledFeatures: [CoreFeatures.GuestsAllowed] } },
        });
        expect(clipboardArg).not.toContain(`global-password`);
        expect(clipboardArg).not.toContain(DEFAULT_PASSWORD);
      });
      it('is not printed if guests are allowed, no invite link is provided and password is provided', async () => {
        const clipboardArg = await setup(defaultInitialState, {
          ...defaultProps,
          inviteUrl: undefined,
        });
        expect(clipboardArg).not.toContain(`global-password`);
        expect(clipboardArg).not.toContain(DEFAULT_PASSWORD);
      });
    });
  });
});
