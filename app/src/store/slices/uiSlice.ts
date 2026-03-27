// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createSelector, createSlice, isAnyOf, ListenerEffectAPI, PayloadAction } from '@reduxjs/toolkit';
import { ErrorEvent } from '@sentry/react';

import type { AppDispatch, RootState } from '../';
import { VoteStarted } from '../../api/types/incoming/legalVote';
import { Started as PollStartedInterface } from '../../api/types/incoming/poll';
import { MenuTab } from '../../components/MenuTabs/fragments/constants';
import { ModerationTabKey } from '../../config/constants';
import LayoutOptions from '../../enums/LayoutOptions';
import { ConnectionState } from '../../modules/WebRTC/ConferenceRoom';
import {
  BreakoutRoomId,
  ChatIdentifier,
  ChatScope,
  ConnectionId,
  ConnectionIdentifier,
  LegalVoteId,
  ParticipantId,
  PollId,
  RoomKind,
  SortOption,
  TimerStyle,
} from '../../types';
import { constructConnectionIdentifier } from '../../utils/constructConnectionIdentifier';
import { hangUp, joinSuccess } from '../commonActions';
import type { StartAppListening } from '../listenerMiddleware';
import { started as automodStarted } from './automodSlice';
import { switchedRoom } from './breakoutSlice';
import { CinemaViewSortOrder } from './common';
import { started as legalVoteStarted } from './legalVoteSlice';
import { setMeetingNotesReadUrl, setMeetingNotesWriteUrl } from './meetingNotesSlice';
import { leave } from './participantsSlice';
import { started as PollStarted } from './pollSlice';
import { connectionClosed } from './roomSlice';
import { timerStarted, timerStopped } from './timerSlice';
import { setWhiteboardAvailable } from './whiteboardSlice';

interface ErrorDialog {
  event: ErrorEvent | undefined;
  showErrorDialog: boolean;
}

export enum UiMode {
  Dashboard = 'dashboard',
  Room = 'room',
}

export const presenterVideoPositions = ['bottomLeft', 'upperRight', 'bottomRight'] as const;

export type PresenterVideoPosition = (typeof presenterVideoPositions)[number];

export type PaginationDirection = 'left' | 'right';

export type UIState = {
  participantsSortOption: SortOption;
  showParticipantGroups: boolean;
  participantsSearchValue: string;
  chatConversationState: ChatIdentifier;
  cinemaLayout: LayoutOptions;
  cinemaViewOrder: CinemaViewSortOrder;
  lastCinemaLayout: LayoutOptions;
  paginationPage: number;
  paginationDirection: PaginationDirection;
  pinnedConnectionIdentifier?: ConnectionIdentifier;
  presenterOverlayPinnedParticipantId?: ConnectionIdentifier;
  localVideoMirroringEnabled: boolean;
  showVoteOrPollResult: boolean;
  voteOrPollIdToShow?: LegalVoteId | PollId;
  chatSearchValue: string;
  isCurrentWhiteboardHighlighted?: boolean;
  isCurrentMeetingNotesHighlighted?: boolean;
  showCoffeeBreakCurtain: boolean;
  activeTab: ModerationTabKey;
  chatAutosavedInputs: {
    [ChatScope.Global]: string;
    [ChatScope.Private]: Record<ParticipantId, string>;
    [ChatScope.Breakout]: Record<BreakoutRoomId, string>;
  };
  hotkeysEnabled: boolean;
  errorDialog: ErrorDialog;
  haveSeenMobilePollsAndVotes: boolean;
  isDrawerOpen: boolean;
  currentMenuTab: MenuTab;
  presenterVideoPosition: PresenterVideoPosition;
  mode?: UiMode;
  showSelfRenameDialog: boolean;
};

export const initialState: UIState = {
  participantsSortOption: SortOption.NameASC,
  showParticipantGroups: false,
  participantsSearchValue: '',
  chatConversationState: {
    scope: ChatScope.Global,
  },
  cinemaLayout: LayoutOptions.Grid,
  cinemaViewOrder: CinemaViewSortOrder.FirstJoined,
  lastCinemaLayout: LayoutOptions.Grid,
  paginationPage: 1,
  paginationDirection: 'right',
  pinnedConnectionIdentifier: undefined,
  presenterOverlayPinnedParticipantId: undefined,
  localVideoMirroringEnabled: true,
  showVoteOrPollResult: false,
  voteOrPollIdToShow: undefined,
  chatSearchValue: '',
  isCurrentWhiteboardHighlighted: undefined,
  isCurrentMeetingNotesHighlighted: undefined,
  showCoffeeBreakCurtain: false,
  activeTab: ModerationTabKey.Home,
  chatAutosavedInputs: {
    [ChatScope.Global]: '',
    [ChatScope.Private]: {},
    [ChatScope.Breakout]: {},
  },
  hotkeysEnabled: true,
  errorDialog: {
    event: undefined,
    showErrorDialog: false,
  },
  haveSeenMobilePollsAndVotes: false,
  isDrawerOpen: false,
  currentMenuTab: MenuTab.Chat,
  presenterVideoPosition: 'bottomRight',
  showSelfRenameDialog: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setParticipantsSortOption: (state, action: PayloadAction<SortOption>) => {
      state.participantsSortOption = action.payload;
    },
    setSortByGroups: (state, { payload }: PayloadAction<boolean>) => {
      state.showParticipantGroups = payload;
    },
    setParticipantsSearchValue: (state, action: PayloadAction<string>) => {
      state.participantsSearchValue = action.payload;
    },
    chatConversationStateSet: (state, action: PayloadAction<ChatIdentifier>) => {
      state.chatConversationState = action.payload;
    },
    updatedCinemaViewSortOrder: (state, action: PayloadAction<CinemaViewSortOrder>) => {
      state.cinemaViewOrder = action.payload;
    },
    updatedCinemaLayout: (state, action: PayloadAction<{ layout: LayoutOptions; cacheLastLayout?: boolean }>) => {
      if (action.payload.cacheLastLayout) {
        state.lastCinemaLayout = action.payload.layout;
      }
      state.cinemaLayout = action.payload.layout;
      if (action.payload.layout === LayoutOptions.Whiteboard && state.isCurrentWhiteboardHighlighted) {
        state.isCurrentWhiteboardHighlighted = false;
      }
      if (action.payload.layout === LayoutOptions.MeetingNotes && state.isCurrentMeetingNotesHighlighted) {
        state.isCurrentMeetingNotesHighlighted = false;
      }
    },
    setPaginationPage: (state, action: PayloadAction<number>) => {
      state.paginationDirection = action.payload > state.paginationPage ? 'left' : 'right';
      state.paginationPage = action.payload;
    },
    pinnedConnectionIdentifierSet: (state, { payload }: PayloadAction<ConnectionIdentifier | undefined>) => {
      state.pinnedConnectionIdentifier = payload;
    },
    presenterOverlayPinnedParticipantIdSet: (state, { payload }: PayloadAction<ConnectionIdentifier | undefined>) => {
      state.presenterOverlayPinnedParticipantId = payload;
    },
    mirroredVideoSet: (state, { payload: enabled }: PayloadAction<boolean>) => {
      state.localVideoMirroringEnabled = enabled;
    },
    setShowVoteOrPollResult(state, { payload: showVoteOrPollResult }: PayloadAction<boolean>) {
      state.showVoteOrPollResult = showVoteOrPollResult;
    },
    setVoteOrPollIdToShow(state, { payload: voteOrPollIdToShow }: PayloadAction<PollId | LegalVoteId | undefined>) {
      state.voteOrPollIdToShow = voteOrPollIdToShow;
    },
    setChatSearchValue(state, { payload: nextSearchValue }: PayloadAction<string>) {
      state.chatSearchValue = nextSearchValue;
    },
    setMeetingNotesHighlight(state, { payload: highlight }: PayloadAction<boolean>) {
      state.isCurrentMeetingNotesHighlighted = highlight;
    },
    setCoffeeBreakCurtainOpenFlag(state, { payload: isOpenFlag }: PayloadAction<boolean>) {
      state.showCoffeeBreakCurtain = isOpenFlag;
    },
    setActiveTab(state, { payload: tabKey }: PayloadAction<ModerationTabKey>) {
      state.activeTab = tabKey;
      if (tabKey === ModerationTabKey.PollsAndLegalVote) {
        state.haveSeenMobilePollsAndVotes = true;
      }
    },
    pinnedRemoteScreenshare(state, { payload: id }: PayloadAction<ConnectionIdentifier>) {
      state.pinnedConnectionIdentifier = id;
      state.lastCinemaLayout = state.cinemaLayout;
    },
    saveDefaultChatMessage(state, { payload }: PayloadAction<ChatIdentifier & { input: string }>) {
      switch (payload.scope) {
        case ChatScope.Global: {
          state.chatAutosavedInputs[ChatScope.Global] = payload.input;
          break;
        }
        case ChatScope.Private: {
          state.chatAutosavedInputs[payload.scope][payload.target] = payload.input;
          break;
        }
        case ChatScope.Breakout: {
          state.chatAutosavedInputs[payload.scope][payload.target] = payload.input;
          break;
        }
      }
    },
    setHotkeysEnabled: (state, { payload }) => {
      state.hotkeysEnabled = payload;
    },
    setShowErrorDialog(state, { payload: { showErrorDialog, event } }: PayloadAction<ErrorDialog>) {
      state.errorDialog.event = event;
      state.errorDialog.showErrorDialog = showErrorDialog;
    },
    setIsDrawerOpen: (state, { payload }) => {
      state.isDrawerOpen = payload;
    },
    setCurrentMenuTab: (state, { payload }: PayloadAction<MenuTab>) => {
      state.currentMenuTab = payload;
    },
    setPresenterVideoPosition: (state, { payload }: PayloadAction<PresenterVideoPosition>) => {
      state.presenterVideoPosition = payload;
    },
    setUiMode: (state, { payload }: PayloadAction<UiMode>) => {
      state.mode = payload;
    },
    setSelfRenameDialogVisible: (state, { payload }: PayloadAction<boolean>) => {
      state.showSelfRenameDialog = payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      leave,
      (state, { payload: { id, connection } }: PayloadAction<{ id: ParticipantId; connection: ConnectionId }>) => {
        const identifier = constructConnectionIdentifier(id, connection);
        if (state.pinnedConnectionIdentifier === identifier) {
          state.pinnedConnectionIdentifier = undefined;
        }
      }
    );
    builder.addCase(hangUp.pending, (state) => {
      state.voteOrPollIdToShow = undefined;
    });
    builder.addCase(hangUp.fulfilled, (state) => {
      state.showCoffeeBreakCurtain = false;
    });
    builder.addCase(connectionClosed, (state) => {
      state.chatConversationState = initialState.chatConversationState;
      state.cinemaLayout = initialState.cinemaLayout;
      state.cinemaViewOrder = initialState.cinemaViewOrder;
      state.participantsSortOption = initialState.participantsSortOption;
      state.pinnedConnectionIdentifier = initialState.pinnedConnectionIdentifier;
      state.paginationPage = initialState.paginationPage;
      state.participantsSearchValue = initialState.participantsSearchValue;
    });
    builder.addCase(setWhiteboardAvailable, (state) => {
      state.isCurrentWhiteboardHighlighted = true;
      state.cinemaLayout = LayoutOptions.Whiteboard;
    });
    builder.addCase(setMeetingNotesReadUrl, (state) => {
      state.isCurrentMeetingNotesHighlighted = true;
    });
    builder.addCase(setMeetingNotesWriteUrl, (state) => {
      state.isCurrentMeetingNotesHighlighted = true;
    });
    builder.addCase(legalVoteStarted, (state, { payload: vote }: PayloadAction<VoteStarted>) => {
      state.voteOrPollIdToShow = vote.legalVoteId;
      state.haveSeenMobilePollsAndVotes = state.isDrawerOpen && state.activeTab === ModerationTabKey.PollsAndLegalVote;
    });
    builder.addCase(PollStarted, (state, { payload: vote }: PayloadAction<PollStartedInterface>) => {
      state.voteOrPollIdToShow = vote.id;
      state.haveSeenMobilePollsAndVotes = state.isDrawerOpen && state.activeTab === ModerationTabKey.PollsAndLegalVote;
    });
    builder.addCase(timerStarted, (state, { payload }) => {
      if (payload.style === TimerStyle.CoffeeBreak) {
        state.showCoffeeBreakCurtain = true;
      }
    });
    builder.addCase(timerStopped, (state) => {
      if (state.showCoffeeBreakCurtain) {
        state.showCoffeeBreakCurtain = false;
      }
    });
    builder.addCase(joinSuccess, (state, { payload: { timer } }) => {
      const cinemaLayoutSettings = loadCinemaLayoutSettingsFromLocalStorage();
      if (cinemaLayoutSettings) {
        state.cinemaLayout = cinemaLayoutSettings.cinemaLayout ?? state.cinemaLayout;
        state.cinemaViewOrder = cinemaLayoutSettings.cinemaViewOrder ?? state.cinemaViewOrder;
      }
      if (timer?.style === TimerStyle.CoffeeBreak) {
        state.showCoffeeBreakCurtain = true;
      }
    });
    builder.addCase(automodStarted, (state) => {
      state.currentMenuTab = MenuTab.People;
    });
    builder.addMatcher(isAnyOf(switchedRoom, joinSuccess), (state, { payload }) => {
      if ('newRoom' in payload && payload.newRoom) {
        if (payload.newRoom.kind === RoomKind.Breakout) {
          state.chatConversationState.scope = ChatScope.Breakout;
          state.chatConversationState.target = payload.newRoom.id;
        } else {
          state.chatConversationState.scope = ChatScope.Global;
          state.chatConversationState.target = undefined;
        }
      }
      if (RoomKind.Breakout in payload && payload.breakout?.room.kind === RoomKind.Breakout) {
        state.chatConversationState.scope = ChatScope.Breakout;
        state.chatConversationState.target = payload.breakout.room.id;
      }
    });
  },
});

export const {
  setParticipantsSortOption,
  setSortByGroups,
  setParticipantsSearchValue,
  chatConversationStateSet,
  updatedCinemaLayout,
  setPaginationPage,
  pinnedConnectionIdentifierSet,
  presenterOverlayPinnedParticipantIdSet,
  mirroredVideoSet,
  setShowVoteOrPollResult,
  setVoteOrPollIdToShow,
  setChatSearchValue,
  setMeetingNotesHighlight,
  setCoffeeBreakCurtainOpenFlag,
  setActiveTab,
  pinnedRemoteScreenshare,
  saveDefaultChatMessage,
  setHotkeysEnabled,
  setShowErrorDialog,
  setIsDrawerOpen,
  updatedCinemaViewSortOrder,
  setCurrentMenuTab,
  setPresenterVideoPosition,
  setUiMode,
  setSelfRenameDialogVisible,
} = uiSlice.actions;

export const actions = uiSlice.actions;

export const selectParticipantsSortOption = (state: RootState) => state.ui.participantsSortOption;
export const selectShowParticipantGroups = (state: RootState) => state.ui.showParticipantGroups;
export const selectParticipantsSearchValue = (state: RootState) => state.ui.participantsSearchValue;
export const selectCinemaLayout = (state: RootState) => state.ui.cinemaLayout;
export const selectCinemaViewOrder = (state: RootState) => state.ui.cinemaViewOrder;
export const selectChatConversationState = (state: RootState) => state.ui.chatConversationState;
export const selectChatConversationTarget = (state: RootState) => state.ui.chatConversationState.target;
export const selectPaginationPageState = (state: RootState) => state.ui.paginationPage;
export const selectPaginationDirectionState = (state: RootState) => state.ui.paginationDirection;
export const selectChatConversationScope = (state: RootState) => state.ui.chatConversationState.scope;
export const selectPinnedConnectionIdentifier = (state: RootState) => state.ui.pinnedConnectionIdentifier;
export const selectPresenterOverlayPinnedParticipantId = (state: RootState) =>
  state.ui.presenterOverlayPinnedParticipantId;
export const selectMirroredVideoEnabled = (state: RootState) => state.ui.localVideoMirroringEnabled;
export const selectShowPollOrVoteResult = (state: RootState) => state.ui.showVoteOrPollResult;
export const selectVoteOrPollIdToShow = (state: RootState) => state.ui.voteOrPollIdToShow;
export const selectChatSearchValue = (state: RootState) => state.ui.chatSearchValue;
export const selectIsCurrentWhiteboardHighlighted = (state: RootState) => state.ui.isCurrentWhiteboardHighlighted;
export const selectIsCurrentMeetingNotesHighlighted = (state: RootState) => state.ui.isCurrentMeetingNotesHighlighted;
export const selectShowCoffeeBreakCurtain = (state: RootState) => state.ui.showCoffeeBreakCurtain;
export const selectActiveTab = (state: RootState) => state.ui.activeTab;
export const selectUiMode = (state: RootState) => state.ui.mode;
export const selectDefaultChatMessage = createSelector(
  [
    (state: RootState) => state.ui.chatAutosavedInputs,
    (_state: RootState, chatIdentifier: ChatIdentifier) => chatIdentifier,
  ],
  (chatAutosavedInputs, { scope, target }) => {
    switch (scope) {
      case ChatScope.Global:
        return chatAutosavedInputs[ChatScope.Global];
      case ChatScope.Private:
        return chatAutosavedInputs[ChatScope.Private][target];
      case ChatScope.Breakout:
        return chatAutosavedInputs[ChatScope.Breakout][target];
    }
  }
);

export const selectHotkeysEnabled = (state: RootState) => state.ui.hotkeysEnabled;
export const selectShowErrorDialog = (state: RootState) => state.ui.errorDialog.showErrorDialog;
export const selectErrorDialogEvent = (state: RootState) => state.ui.errorDialog.event;
export const selectHaveSeenMobilePollsAndVotes = (state: RootState) => state.ui.haveSeenMobilePollsAndVotes;
export const selectIsDrawerOpen = (state: RootState) => state.ui.isDrawerOpen;
export const selectCurrentMenuTab = (state: RootState) => state.ui.currentMenuTab;
export const selectPresenterVideoPosition = (state: RootState) => state.ui.presenterVideoPosition;

export default uiSlice.reducer;

/************************************************/
/*                                              */
/*                  Listeners                   */
/*                                              */
/************************************************/

const startUiChangeModeListener = (startAppListening: StartAppListening) =>
  startAppListening({
    actionCreator: setUiMode,
    effect: (action, listenerApi: ListenerEffectAPI<RootState, AppDispatch>) => {
      if (
        action.payload === UiMode.Dashboard &&
        listenerApi.getState().room.connectionState === ConnectionState.Online
      ) {
        listenerApi.dispatch(hangUp());
      }
    },
  });

const startLayoutChangeListener = (startAppListening: StartAppListening) =>
  startAppListening({
    matcher: isAnyOf(updatedCinemaLayout, updatedCinemaViewSortOrder),
    effect: (_, listenerApi: ListenerEffectAPI<RootState, AppDispatch>) => {
      const updatedLayoutSettings = {
        cinemaLayout: listenerApi.getState().ui.cinemaLayout,
        cinemaViewOrder: listenerApi.getState().ui.cinemaViewOrder,
      };
      storeCinemaLayoutSettingsToLocalStorage(updatedLayoutSettings);
    },
  });

export const startUiListeners = (startAppListening: StartAppListening) => {
  startUiChangeModeListener(startAppListening);
  startLayoutChangeListener(startAppListening);
};

export const selectSelfRenameDialogVisible = (state: RootState) => state.ui.showSelfRenameDialog;

export const loadCinemaLayoutSettingsFromLocalStorage = (): Partial<UIState> | undefined => {
  const storageItem = localStorage.getItem('cinemaLayoutSettings');
  if (storageItem !== null) {
    return JSON.parse(storageItem);
  }

  return undefined;
};

export const storeCinemaLayoutSettingsToLocalStorage = (
  cinemaLayoutSettings: Pick<UIState, 'cinemaLayout' | 'cinemaViewOrder'>
) => {
  localStorage.setItem('cinemaLayoutSettings', JSON.stringify(cinemaLayoutSettings));
};
