// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import AccordionItem from './AccordionItem';
import CommonFormItem from './CommonFormItem';
import CommonSwitch from './CommonSwitch';
import CommonTextField from './CommonTextField';
import CopyTextField from './CopyTextField';
import DurationField, { DurationValueOptions } from './DurationField';
import ErrorFormMessage from './ErrorFormMessage';
import FormWrapper from './FormWrapper';
import { AdornmentIconButton, CircularIconButton, IconButton, InfoButton } from './IconButtons';
import NameTile from './NameTile';
import {
  SnackbarProvider,
  notificationAction,
  notificationPersistent,
  notifications,
  createStackedMessages,
  startTimeLimitNotification,
  stopTimeLimitNotification,
  showConsentNotification,
} from './Notistack';
import { ISnackActionsProps, ISnackbarPersistentProps } from './Notistack';
import { SnackbarActionButtonProps } from './Notistack/fragments/SnackbarActionButtons/SnackbarActionButtons';
import ParticipantAvatar, { setLibravatarOptions } from './ParticipantAvatar';
import ProgressBar from './ProgressBar';
import Rating from './Rating';
import SortPopoverMenu from './SortPopoverMenu';
import SuspenseLoading from './SuspenseLoading';
import Toggle, { ToggleOptions } from './Toggle';
import ToolbarMenuUtils from './ToolbarMenuUtils';
import VisuallyHiddenTitle from './VisuallyHiddenTitle';

export {
  AccordionItem,
  CommonFormItem,
  CommonTextField,
  CommonSwitch,
  CopyTextField,
  DurationField,
  NameTile,
  ErrorFormMessage,
  Rating,
  FormWrapper,
  SuspenseLoading,
  ToolbarMenuUtils,
  AdornmentIconButton,
  CircularIconButton,
  IconButton,
  InfoButton,
  SnackbarProvider,
  notificationAction,
  notificationPersistent,
  notifications,
  createStackedMessages,
  startTimeLimitNotification,
  stopTimeLimitNotification,
  showConsentNotification,
  ParticipantAvatar,
  setLibravatarOptions,
  ProgressBar,
  SortPopoverMenu,
  Toggle,
  VisuallyHiddenTitle,
};

export type {
  ISnackActionsProps,
  ISnackbarPersistentProps,
  SnackbarActionButtonProps,
  ToggleOptions,
  DurationValueOptions,
};
