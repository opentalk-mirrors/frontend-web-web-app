// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { renderWithProviders } from '../../utils/testUtils';
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
  it('is empty when no meetings available', () => {
    renderWithProviders(
      <BrowserRouter>
        <FavoriteMeetingsCard meetings={[]} />
      </BrowserRouter>,
      { provider: { mui: true } }
    );

    expect(screen.getByTestId('empty-entry')).toBeInTheDocument();
  });
  it('contains all favorited meetings', () => {
    renderWithProviders(
      <BrowserRouter>
        <FavoriteMeetingsCard meetings={dummyMeetings} />
      </BrowserRouter>,
      { provider: { mui: true } }
    );

    expect(screen.queryAllByRole('link')).toHaveLength(dummyMeetings.length);
  });
});
