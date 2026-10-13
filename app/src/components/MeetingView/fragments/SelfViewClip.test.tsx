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

vi.mock('../../HandRaisedIndicator', () => ({
  __esModule: true,
  default: ({ label }: { label: string }) => <div data-testid="hand-raised-indicator">{label}</div>,
}));

vi.mock('../../ReactionIndicator', () => ({
  __esModule: true,
  default: ({ participantId }: { participantId: string }) => (
    <div data-testid="reaction-indicator">{participantId}</div>
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

  it('renders the reaction indicator, passing our uuid', () => {
    const participantId = '123456789';
    const { store } = configureStore({
      initialState: {
        user: {
          uuid: participantId,
        },
      },
    });
    renderWithProviders(<SelfViewClip id="clip-id" />, { store, provider: { mui: true } });
    expect(screen.getByTestId('reaction-indicator')).toHaveTextContent(participantId);
  });

  it('does not render the reaction indicator if our uuid is missing', () => {
    const { store } = configureStore({
      initialState: {
        user: {
          uuid: null,
        },
      },
    });
    renderWithProviders(<SelfViewClip id="clip-id" />, { store, provider: { mui: true } });
    expect(screen.queryByTestId('reaction-indicator')).not.toBeInTheDocument();
  });

  it('renders the hand raised indicator with the "you want to say something" label when our hand is up', () => {
    const { store } = configureStore({
      initialState: {
        moderation: {
          hasHandUp: true,
        },
      },
    });
    renderWithProviders(<SelfViewClip id="clip-id" />, { store, provider: { mui: true } });
    expect(screen.getByTestId('hand-raised-indicator')).toHaveTextContent('indicator-you-have-raised-hand');
  });

  it('does not render the hand raised indicator when our hand is down', () => {
    const { store } = configureStore({
      initialState: {
        moderation: {
          hasHandUp: false,
        },
      },
    });
    renderWithProviders(<SelfViewClip id="clip-id" />, { store, provider: { mui: true } });
    expect(screen.queryByTestId('hand-raised-indicator')).not.toBeInTheDocument();
  });
});
