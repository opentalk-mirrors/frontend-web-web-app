// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render } from '@testing-library/react';

import MobileMeetingHeader from './MobileMeetingHeader';

vi.mock('../fragments/LayoutSelection', () => ({
  __esModule: true,
  default: () => <div>LayoutSelection</div>,
}));

vi.mock('../fragments/MeetingTimer', () => ({
  __esModule: true,
  default: () => <div>MeetingTimer</div>,
}));

vi.mock('../fragments/RoomTitle', () => ({
  __esModule: true,
  default: () => <div>RoomTitle</div>,
}));

vi.mock('./fragments/Drawer', () => ({
  __esModule: true,
  default: () => <div>Drawer</div>,
}));

vi.mock('./fragments/MobilePagination', () => ({
  __esModule: true,
  default: () => <div>MobilePagination</div>,
}));

describe('MobileMeetingHeader', () => {
  it('renders without crashing', () => {
    expect(() => render(<MobileMeetingHeader />)).not.toThrow();
  });
});
