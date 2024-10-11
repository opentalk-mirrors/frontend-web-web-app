// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { BrowserRouter } from 'react-router-dom';

import { screen, render, cleanup } from '../../utils/testUtils';
import FavoriteMeetingsCard from './FavoriteMeetingsCard';

const dummyMeetings = [
  { subject: 'Lorem ipsum dolor sit.', roomId: '3445t-wre-gd-gtrgear-ggszr' as RoomId },
  { subject: 'Lorem ipsum dolor sit amet.', roomId: '3445twre-gtrfg566-7arggszr' as RoomId },
  { subject: 'Ipsum dolor.', roomId: '0000-00-00-0-0-5' as RoomId },
  { subject: 'Amet consectetur adipisicing.', roomId: '3445tw-gfd-regtrge-arggszr' as RoomId },
  { subject: 'Dolor Lorem, ipsum.', roomId: '344-5twregtr-gearggszr-4355' as RoomId },
  { subject: 'Ipsum dolor sit.', roomId: '9694-45twre-gtrgearg-gszr-ewds43' as RoomId },
];

describe('favorite meetings card', () => {
  afterEach(() => cleanup());
  test('is empty when no meetings available', async () => {
    await render(
      <BrowserRouter>
        <FavoriteMeetingsCard meetings={[]} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('empty-entry')).toBeInTheDocument();
  });
  test('contains all favorited meetings', async () => {
    await render(
      <BrowserRouter>
        <FavoriteMeetingsCard meetings={dummyMeetings} />
      </BrowserRouter>
    );

    expect(screen.queryAllByRole('link')).toHaveLength(dummyMeetings.length);
  });
});
