// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SelfViewAnchorContext from '../../../provider/SelfViewAnchorContext';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import SelfView from './SelfView';

vi.mock('./SelfViewClip', () => ({
  __esModule: true,
  default: ({ id }: { id: string }) => <div data-testid="selfview-clip-stub" id={id} />,
}));

vi.mock('./SelfViewBar', () => ({
  __esModule: true,
  default: ({ id }: { id: string }) => <div data-testid="selfview-bar-stub" id={id} />,
}));

vi.mock('../../../assets/icons', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../assets/icons')>()),
  CloseFullscreenIcon: () => <svg data-testid="close-fullscreen-icon" />,
  OpenInFullIcon: () => <svg data-testid="open-in-full-icon" />,
}));

const renderSelfView = (isSelfViewMinimized = false) => {
  const { store } = configureStore({ initialState: { ui: { isSelfViewMinimized } } });
  const view = renderWithProviders(<SelfView />, { store, provider: { mui: true } });
  return { store, ...view };
};

describe('SelfView', () => {
  it('portals into the provided anchor element', () => {
    const { store } = configureStore();
    const anchor = document.createElement('div');
    document.body.appendChild(anchor);

    const { container } = renderWithProviders(
      <SelfViewAnchorContext.Provider value={{ anchor, setAnchor: vi.fn() }}>
        <SelfView />
      </SelfViewAnchorContext.Provider>,
      { store, provider: { mui: true } }
    );

    expect(anchor).toContainElement(screen.getByTestId('selfview-clip-stub'));
    expect(container).not.toContainElement(screen.getByTestId('selfview-clip-stub'));

    anchor.remove();
  });

  it('renders inline (no portal) when no anchor is set', () => {
    const { container } = renderSelfView();
    expect(container).toContainElement(screen.getByTestId('selfview-clip-stub'));
  });

  describe('in expanded state', () => {
    it('renders the clip and not the bar', () => {
      renderSelfView(false);
      expect(screen.getByTestId('selfview-clip-stub')).toBeInTheDocument();
      expect(screen.queryByTestId('selfview-bar-stub')).not.toBeInTheDocument();
    });

    it('renders a minimize button controlling the clip', () => {
      renderSelfView(false);
      const button = screen.getByRole('button', { name: 'selfview-minimize' });
      expect(button).toContainElement(screen.getByTestId('close-fullscreen-icon'));
      expect(button).toHaveAttribute('aria-controls', screen.getByTestId('selfview-clip-stub').id);
    });

    it('shows a tooltip when hovering over a button', async () => {
      const user = userEvent.setup();
      renderSelfView(false);
      const button = screen.getByRole('button', { name: 'selfview-minimize' });

      await user.hover(button);

      const tooltip = await screen.findByRole('tooltip', { name: 'selfview-minimize' });
      expect(tooltip).toBeInTheDocument();
    });
  });

  describe('in minimized state', () => {
    it('renders the bar and not the clip', () => {
      renderSelfView(true);
      expect(screen.getByTestId('selfview-bar-stub')).toBeInTheDocument();
      expect(screen.queryByTestId('selfview-clip-stub')).not.toBeInTheDocument();
    });

    it('renders an expand button controlling the bar', () => {
      renderSelfView(true);
      const button = screen.getByRole('button', { name: 'selfview-expand' });
      expect(button).toContainElement(screen.getByTestId('open-in-full-icon'));
      expect(button).toHaveAttribute('aria-controls', screen.getByTestId('selfview-bar-stub').id);
    });

    it('shows a tooltip when hovering over a button', async () => {
      const user = userEvent.setup();
      renderSelfView(true);
      const button = screen.getByRole('button', { name: 'selfview-expand' });

      await user.hover(button);

      const tooltip = await screen.findByRole('tooltip', { name: 'selfview-expand' });
      expect(tooltip).toBeInTheDocument();
    });
  });

  it('toggles the minimized state on click', async () => {
    const user = userEvent.setup();
    const { store } = renderSelfView(false);

    await user.click(screen.getByRole('button', { name: 'selfview-minimize' }));
    expect(store.getState().ui.isSelfViewMinimized).toBe(true);
    expect(screen.getByTestId('selfview-bar-stub')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'selfview-expand' }));
    expect(store.getState().ui.isSelfViewMinimized).toBe(false);
    expect(screen.getByTestId('selfview-clip-stub')).toBeInTheDocument();
  });
});
