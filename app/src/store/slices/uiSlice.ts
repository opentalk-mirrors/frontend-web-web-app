// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createSelector, createSlice, ListenerEffectAPI, PayloadAction } from '@reduxjs/toolkit';
import { ErrorEvent } from '@sentry/react';

import type { AppDispatch, RootState } from '../';
import { VoteStarted } from '../../api/types/incoming/legalVote';
import { Started as PollStartedInterface } from '../../api/types/incoming/poll';
import { MenuTab } from '../../components/MenuTabs/fragments/constants';
import { ModerationTabKey } from '../../config/constants';
import LayoutOptions from '../../enums/LayoutOptions';
import { ConnectionState } from '../../modules/WebRTC/ConferenceRoom';
import {
  ChatScope,
  ConnectionId,
  ConnectionIdentifier,
  LegalVoteId,
  ParticipantId,
  PollId,
  SortOption,
  TargetId,
  TimerStyle,
} from '../../types';
import { constructConnectionIdentifier } from '../../utils/constructConnectionIdentifier';
import { hangUp, joinSuccess } from '../commonActions';
import type { StartAppListening } from '../listenerMiddleware';
import { started as automodStarted } from './automodSlice';
import { CinemaViewSortOrder } from './common';
import { started as legalVoteStarted } from './legalVoteSlice';
import { setMeetingNotesReadUrl, setMeetingNotesWriteUrl } from './meetingNotesSlice';
import { leave } from './participantsSlice';
import { started as PollStarted } from './pollSlice';
import { connectionClosed } from './roomSlice';
import { timerStarted, timerStopped } from './timerSlice';
import { setWhiteboardAvailable } from './whiteboardSlice';

export interface IChatConversationState {
  scope: ChatScope;
  targetId?: TargetId;
}

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
  chatConversationState: IChatConversationState;
  cinemaLayout: LayoutOptions;
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
    [ChatScope.Private]: Record<TargetId, string>;
    [ChatScope.Breakout]: Record<TargetId, string>;
  };
  hotkeysEnabled: boolean;
  errorDialog: ErrorDialog;
  haveSeenMobilePollsAndVotes: boolean;
  isDrawerOpen: boolean;
  cinemaViewOrder: CinemaViewSortOrder;
  currentMenuTab: MenuTab;
  presenterVideoPosition: PresenterVideoPosition;
  mode?: UiMode;
};

const initialState: UIState = {
  participantsSortOption: SortOption.NameASC,
  showParticipantGroups: false,
  participantsSearchValue: '',
  chatConversationState: {
    scope: ChatScope.Global,
    targetId: undefined,
  },
  cinemaLayout: LayoutOptions.Grid,
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
  cinemaViewOrder: CinemaViewSortOrder.FirstJoined,
  currentMenuTab: MenuTab.Chat,
  presenterVideoPosition: 'bottomRight',
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
    chatConversationStateSet: (state, action: PayloadAction<IChatConversationState>) => {
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
    saveDefaultChatMessage(
      state,
      { payload }: PayloadAction<{ scope: ChatScope; targetId?: TargetId; input: string }>
    ) {
      if (payload.scope === ChatScope.Global) {
        state.chatAutosavedInputs[ChatScope.Global] = payload.input;
        return;
      }

      if (payload.targetId) {
        state.chatAutosavedInputs[payload.scope][payload.targetId] = payload.input;
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
      if (timer?.style === TimerStyle.CoffeeBreak) {
        state.showCoffeeBreakCurtain = true;
      }
    });
    builder.addCase(automodStarted, (state) => {
      state.currentMenuTab = MenuTab.People;
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
} = uiSlice.actions;

export const actions = uiSlice.actions;

export const selectParticipantsSortOption = (state: RootState) => state.ui.participantsSortOption;
export const selectShowParticipantGroups = (state: RootState) => state.ui.showParticipantGroups;
export const selectParticipantsSearchValue = (state: RootState) => state.ui.participantsSearchValue;
export const selectCinemaLayout = (state: RootState) => state.ui.cinemaLayout;
export const selectChatConversationState = (state: RootState) => state.ui.chatConversationState;
export const selectChatConversationTargetId = (state: RootState) => state.ui.chatConversationState.targetId;
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
    (_state: RootState, scope: ChatScope) => scope,
    (_state: RootState, _scope: ChatScope, targetId?: TargetId) => targetId,
  ],
  (chatAutosavedInputs, scope, targetId) => {
    if (scope === ChatScope.Global) {
      return chatAutosavedInputs[ChatScope.Global];
    }

    if (targetId && chatAutosavedInputs[scope][targetId]) {
      return chatAutosavedInputs[scope][targetId];
    }

    return '';
  }
);

export const selectHotkeysEnabled = (state: RootState) => state.ui.hotkeysEnabled;
export const selectShowErrorDialog = (state: RootState) => state.ui.errorDialog.showErrorDialog;
export const selectErrorDialogEvent = (state: RootState) => state.ui.errorDialog.event;
export const selectHaveSeenMobilePollsAndVotes = (state: RootState) => state.ui.haveSeenMobilePollsAndVotes;
export const selectIsDrawerOpen = (state: RootState) => state.ui.isDrawerOpen;
export const selectCinemaViewOrder = (state: RootState) => state.ui.cinemaViewOrder;
export const selectCurrentMenuTab = (state: RootState) => state.ui.currentMenuTab;
export const selectPresenterVideoPosition = (state: RootState) => state.ui.presenterVideoPosition;

export default uiSlice.reducer;

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

export const startUiListeners = (startAppListening: StartAppListening) => {
  startUiChangeModeListener(startAppListening);
};
