// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { AppDispatch, RootState } from '../../../store';
import { getActive, getDefaultTarget, isBrowser } from '../../../utils/browserUtils';
import { toErrorMessage } from '../../../utils/error';
import type { StartAppListening } from '../../listenerMiddleware';
import { fullscreenActions, selectFullscreenActive, selectFullscreenElement } from './slice';
import type { RequestFullscreenPayload } from './types';

export const bindFullscreenEventsToRedux = (dispatch: AppDispatch) => {
  if (isBrowser()) {
    const fullscreenOnChange = () => {
      dispatch(fullscreenActions.changed({ active: getActive() }));
    };

    const fullscreenOnError = () => {
      dispatch(fullscreenActions.failed({ message: 'Fullscreen error' }));
    };

    document.addEventListener('fullscreenchange', fullscreenOnChange);
    document.addEventListener('fullscreenerror', fullscreenOnError);

    return () => {
      document.removeEventListener('fullscreenchange', fullscreenOnChange);
      document.removeEventListener('fullscreenerror', fullscreenOnError);
    };
  }
};

export function startFullscreenListeners(startListening: StartAppListening) {
  startListening({
    actionCreator: fullscreenActions.request,
    effect: async (action, listenerApi) => {
      if (!isBrowser()) {
        return;
      }

      const state = listenerApi.getState() as RootState;
      const fullscreenElement = selectFullscreenElement(state);

      const element: HTMLElement | null =
        ((action.payload as RequestFullscreenPayload | undefined)?.element || fullscreenElement) ?? getDefaultTarget();

      if (!element) {
        listenerApi.dispatch(fullscreenActions.failed({ message: 'No fullscreen target element' }));
        return;
      }

      try {
        await element.requestFullscreen();
        window.dispatchEvent(new CustomEvent('hotkeys:clearPushedKeys'));
      } catch (e) {
        listenerApi.dispatch(fullscreenActions.failed({ message: toErrorMessage(e) }));
      }
    },
  });

  startListening({
    actionCreator: fullscreenActions.exit,
    effect: async (_action, listenerApi) => {
      if (!isBrowser()) {
        return;
      }

      try {
        await document.exitFullscreen();
        window.dispatchEvent(new CustomEvent('hotkeys:clearPushedKeys'));
      } catch (e) {
        listenerApi.dispatch(fullscreenActions.failed({ message: toErrorMessage(e) }));
      }
    },
  });

  startListening({
    actionCreator: fullscreenActions.toggle,
    effect: async (_action, listenerApi) => {
      const state = listenerApi.getState() as RootState;

      if (selectFullscreenActive(state)) {
        listenerApi.dispatch(fullscreenActions.exit());
      } else {
        listenerApi.dispatch(fullscreenActions.request());
      }
    },
  });

  startListening({
    actionCreator: fullscreenActions.setElement,
    effect: async (action, listenerApi) => {
      if (!isBrowser()) {
        return;
      }

      const state = listenerApi.getState() as RootState;

      if (selectFullscreenActive(state)) {
        try {
          await document.exitFullscreen();
          await action.payload?.element?.requestFullscreen();
        } catch (e) {
          listenerApi.dispatch(fullscreenActions.failed({ message: toErrorMessage(e) }));
          return;
        }
      }
    },
  });
}
