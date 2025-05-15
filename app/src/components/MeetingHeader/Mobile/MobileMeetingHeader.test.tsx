// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render } from '@testing-library/react';

import MobileMeetingHeader from './MobileMeetingHeader';

jest.mock('../fragments/LayoutSelection', () => ({
  __esModule: true,
  default: () => <div>LayoutSelection</div>,
}));

jest.mock('../fragments/MeetingTimer', () => ({
  __esModule: true,
  default: () => <div>MeetingTimer</div>,
}));

jest.mock('../fragments/RoomTitle', () => ({
  __esModule: true,
  default: () => <div>RoomTitle</div>,
}));

jest.mock('./fragments/Drawer', () => ({
  __esModule: true,
  default: () => <div>Drawer</div>,
}));

jest.mock('./fragments/MobilePagination', () => ({
  __esModule: true,
  default: () => <div>MobilePagination</div>,
}));

describe('MobileMeetingHeader', () => {
  it('renders without crashing', () => {
    expect(() => render(<MobileMeetingHeader />)).not.toThrow();
  });
});
