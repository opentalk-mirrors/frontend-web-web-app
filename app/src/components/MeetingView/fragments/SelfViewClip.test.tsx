// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import type { NameTileProps } from '../../../commonComponents/NameTile';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import { SelfVideoContentProps } from './SelfVideoContent';
import SelfViewClip from './SelfViewClip';

vi.mock('../../../commonComponents/NameTile', () => ({
  __esModule: true,
  default: (props: NameTileProps) => (
    <div data-testid="name-tile">
      {props.displayName}
      {props.showIcons && <div data-testid="icons" />}
    </div>
  ),
}));

vi.mock('./SelfVideoContent', () => ({
  __esModule: true,
  default: (props: SelfVideoContentProps) => <div data-testid="self-video-content">{props.displayName}</div>,
}));

describe('SelfViewClip', () => {
  it('puts the given id on the root element', () => {
    const { store } = configureStore();
    renderWithProviders(<SelfViewClip id="clip-id" />, { store, provider: { mui: true } });
    expect(screen.getByTestId('selfview-clip')).toHaveAttribute('id', 'clip-id');
  });

  it('renders video content', () => {
    const { store } = configureStore();
    renderWithProviders(<SelfViewClip id="clip-id" />, { store, provider: { mui: true } });
    expect(screen.getByTestId('self-video-content')).toBeInTheDocument();
  });

  it('passes display name to video content', () => {
    const { store } = configureStore({
      initialState: {
        user: {
          displayName: 'Bob Benton',
        },
      },
    });
    renderWithProviders(<SelfViewClip id="clip-id" />, { store, provider: { mui: true } });
    expect(screen.getByTestId('self-video-content')).toHaveTextContent('Bob Benton');
  });

  it('passes "you" as name to the name tile', () => {
    const { store } = configureStore();
    renderWithProviders(<SelfViewClip id="clip-id" />, { store, provider: { mui: true } });
    expect(screen.getByTestId('name-tile')).toHaveTextContent('global-you');
  });

  it('prevents rendering icons in the name tile', () => {
    const { store } = configureStore();
    renderWithProviders(<SelfViewClip id="clip-id" />, { store, provider: { mui: true } });
    expect(screen.getByTestId('name-tile')).toBeInTheDocument();
    expect(screen.queryByTestId('icons')).not.toBeInTheDocument();
  });
});
