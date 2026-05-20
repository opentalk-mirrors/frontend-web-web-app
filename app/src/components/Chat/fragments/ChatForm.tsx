// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { CircularProgress, InputAdornment, Popover, Tooltip, styled, useTheme } from '@mui/material';
import Picker, {
  EmojiClickData,
  SkinTones,
  EmojiStyle,
  Theme,
  SkinTonePickerLocation,
  SuggestionMode,
  Categories,
} from 'emoji-picker-react';
import { useFormik } from 'formik';
import {
  FocusEvent,
  KeyboardEvent,
  KeyboardEventHandler,
  MouseEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { sendChatMessage } from '../../../api/types/outgoing/chat';
import { EmojiIcon, SendMessageIcon } from '../../../assets/icons';
import { AdornmentIconButton, CommonTextField, ErrorFormMessage, VisuallyHiddenTitle } from '../../../commonComponents';
import { CHAT_INPUT_ID } from '../../../constants';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  MessageDelayType,
  selectChatEnabledState,
  selectChatMessageSlowDown,
  setSlowDownDelay,
} from '../../../store/slices/chatSlice';
import {
  saveDefaultChatMessage,
  selectChatConversationScope,
  selectChatConversationTarget,
  selectDefaultChatMessage,
} from '../../../store/slices/uiSlice';
import { ChatIdentifier, ChatScope } from '../../../types';
import { formikGetValue, formikProps } from '../../../utils/formikUtils';
import yup from '../../../utils/yupUtils';

const Form = styled('form')({
  position: 'relative',
});

//we make the button smaller so it fits inside the input field
const SendMessageButton = styled(AdornmentIconButton)(({ theme }) => ({
  width: theme.typography.pxToRem(36),
  height: theme.typography.pxToRem(36),
}));

/**
 * We have to adjust here because there is no glyphicon in this button
 * there is an emoji. It screws up all sizes and makes the ripple effect
 * cut through the border of the parent input field
 */
const EmojiIconButton = styled(AdornmentIconButton)({
  padding: '0.5rem',
  lineHeight: '1.25rem',
});

const PickerContainer = styled('div')(({ theme }) => ({
  width: '100%',

  '.EmojiPickerReact.epr-dark-theme': {
    '--epr-dark': theme.palette.background.highlight.primary,
    '--epr-bg-color': theme.palette.background.highlight.primary,
    '--epr-category-label-bg-color': theme.palette.background.highlight.primary,
    '--epr-picker-border-color': theme.palette.background.highlight.primary,
    '--epr-search-input-bg-color': theme.palette.primary.main,
    '--epr-hover-bg-color': theme.palette.primary.main,
    '--epr-category-icon-active-color': theme.palette.secondary.main,
    '--epr-highlight-color': theme.palette.primary.main,
    '--epr-search-border-color': theme.palette.primary.main,
    '--epr-search-input-text-color': theme.palette.background.highlight.primary,
    '--epr-focus-bg-color': theme.palette.background.highlight.primary,
  },

  '.EmojiPickerReact .epr-search-container input[aria-controls="epr-search-id"]:focus': {
    '--epr-search-input-text-color': theme.palette.background.highlight.contrastText,
  },

  '.EmojiPickerReact .epr-category-nav': {
    display: 'none',
  },

  '.EmojiPickerReact .epr-search-container [role="status"]+div': {
    'background-position-y': 0,
  },
}));

const MAX_CHAT_CHARS = 4000;

const ChatForm = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [openPicker, setOpenPicker] = useState(false);
  const [pickerAnchor, setPickerAnchor] = useState<HTMLButtonElement | null>(null);
  const [hasFocus, setFocus] = useState(false);
  const isChatEnabled = useAppSelector(selectChatEnabledState);
  const emojiButton = useRef<HTMLButtonElement | null>(null);
  const scope = useAppSelector(selectChatConversationScope);
  const target = useAppSelector(selectChatConversationTarget);
  const chatIdentifier = { scope, target } as ChatIdentifier;
  const defaultChatMessage = useAppSelector((state) => selectDefaultChatMessage(state, chatIdentifier));
  const messageInputReference = useRef<HTMLInputElement>(null);
  const autoFocusMessageInputOnPrivateMessages = scope === ChatScope.Private && Boolean(target);
  const chatSlowDownDelay = useAppSelector(selectChatMessageSlowDown);
  const [chatInputLoading, setChatInputLoading] = useState(false);
  const delayedSubmitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const freezeChatInput = chatInputLoading && chatSlowDownDelay?.type === MessageDelayType.SlowDown;
  const isLimitReached = chatSlowDownDelay && chatSlowDownDelay.type === MessageDelayType.LimitReached;
  const hasPositiveDelayMs =
    typeof chatSlowDownDelay?.delayMs === 'number' &&
    Number.isFinite(chatSlowDownDelay.delayMs) &&
    chatSlowDownDelay.delayMs > 0;

  const clearDelayedSubmitTimeout = () => {
    if (delayedSubmitTimeoutRef.current) {
      clearTimeout(delayedSubmitTimeoutRef.current);
      delayedSubmitTimeoutRef.current = null;
    }
  };

  const scheduleDelayedSubmit = (delay: number, submitAction: () => void) => {
    clearDelayedSubmitTimeout();
    delayedSubmitTimeoutRef.current = setTimeout(() => {
      delayedSubmitTimeoutRef.current = null;
      submitAction();
    }, delay);
  };

  useEffect(() => {
    return clearDelayedSubmitTimeout;
  }, []);

  const dispatchSaveDefaultChatMessage = (input: string) => {
    dispatch(saveDefaultChatMessage({ ...chatIdentifier, input }));
  };

  useLayoutEffect(
    function bootstrapMessageInputAutofocusing() {
      if (autoFocusMessageInputOnPrivateMessages && messageInputReference.current) {
        /**
         * Not a big fan of the solution but at the moment I couldn't find
         * proper way to put nested textarea in the MUI BaseInput component in focus.
         * Reference object is pointing to the HTMLDivElement and calling .focus on it does
         * nothing.
         */
        const nestedTextarea = messageInputReference.current.querySelector('textarea');
        if (nestedTextarea) {
          nestedTextarea.focus();
        }
      }
    },
    [autoFocusMessageInputOnPrivateMessages]
  );

  const emojiPickerCategories = useMemo(() => {
    return Object.values(Categories).reduce(
      (categories, category) => {
        if (category === Categories.SUGGESTED) {
          return categories;
        }
        return categories.concat({ category, name: t(`emoji-category-${category}`) });
      },
      [] as Array<{ category: Categories; name: string }>
    );
  }, [t]);

  const handleEmojiClick = (data: EmojiClickData) => {
    const message = formik.values.message + data.emoji;
    formik.setFieldValue('message', message);
    dispatchSaveDefaultChatMessage(message);
  };

  const blurHandler = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target && event.target.tagName === 'INPUT') {
      dispatchSaveDefaultChatMessage(formikGetValue('message', formik, ''));
    }
  };

  const onEmojiPickerContainerKeyDown = (event: KeyboardEvent) => {
    /**
     * Since we don't have direct access to the library's search field, we depend on event bubbling and identify the source element of the event.
     *
     * With only one nested input field, we can safely rely on this check.
     */
    if (event.key === 'Escape' && 'tagName' in event.target && (event.target as HTMLElement).tagName === 'INPUT') {
      setOpenPicker(false);
      setPickerAnchor(null);
      /**
       * The emoji picker state is managed within the same component as the emoji button, leading to re-renders.
       * When the state changes, it overrides the focused button, causing it to lose focus. Therefore,
       * this workaround ensures the emoji button regains focus in the next painting cycle after the re-render completes.
       *
       * Focusing the triggering button is necessary for accessibility compliance (A11Y).
       */
      requestAnimationFrame(() => {
        if (emojiButton.current) {
          emojiButton.current.focus();
        }
      });
    }
  };

  const isPickerOpen = openPicker && isChatEnabled;

  const renderPicker = () => (
    <Popover
      open={isPickerOpen}
      anchorEl={isPickerOpen ? pickerAnchor : null}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      onClose={() => {
        setOpenPicker(false);
        setPickerAnchor(null);
      }}
      slotProps={{
        paper: {
          role: 'dialog',
          'aria-label': 'Emoji picker',
        },
      }}
    >
      <PickerContainer
        onBlur={blurHandler}
        onKeyDown={onEmojiPickerContainerKeyDown}
        onKeyUp={(event) => event.stopPropagation()}
      >
        <Picker
          onEmojiClick={handleEmojiClick}
          autoFocusSearch={true}
          defaultSkinTone={SkinTones.MEDIUM_LIGHT}
          lazyLoadEmojis={true}
          emojiVersion="11"
          theme={Theme.DARK}
          previewConfig={{
            showPreview: false,
          }}
          categories={emojiPickerCategories}
          searchPlaceHolder=""
          emojiStyle={EmojiStyle.NATIVE}
          skinTonePickerLocation={SkinTonePickerLocation.SEARCH}
          suggestedEmojisMode={SuggestionMode.RECENT}
          width="300px"
        />
      </PickerContainer>
    </Popover>
  );

  const handleSubmitOnEnter: KeyboardEventHandler<HTMLInputElement> = (event) => {
    // Workaround for handling dead keys (special char) for German and other non-english keyboards
    if (event.key === 'Dead') {
      const nestedTextarea = messageInputReference.current?.querySelector('textarea');
      nestedTextarea?.blur();
      nestedTextarea?.focus();
    }
    if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      event.stopPropagation();
      formik.handleSubmit();
    }
  };

  const validationSchema = yup.object({
    message: yup.string().trim().maxBytes(MAX_CHAT_CHARS).required(t('chat-input-error-required')),
  });

  const sendMessage = (message: string) => {
    dispatch(
      sendChatMessage.action({
        ...chatIdentifier,
        content: message,
      })
    );
  };

  const formik = useFormik({
    initialValues: { message: defaultChatMessage },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: false,
    enableReinitialize: true, // It is essential to reinitialize in order to pick up new default input message.
    onSubmit: (values, { resetForm }) => {
      if (chatInputLoading) {
        return;
      }
      if (hasPositiveDelayMs) {
        setChatInputLoading(true);
        const delay = isLimitReached ? Math.max(chatSlowDownDelay.delayMs, 3000) : chatSlowDownDelay.delayMs;
        scheduleDelayedSubmit(delay, () => {
          dispatch(setSlowDownDelay(undefined));
          setChatInputLoading(false);
          if (isLimitReached) {
            return;
          }
          sendMessage(values.message);
        });
      } else {
        sendMessage(values.message);
      }
      resetForm();
      setOpenPicker(false);
      dispatchSaveDefaultChatMessage('');
    },
  });

  const handleFormBlur = (e: FocusEvent<HTMLInputElement>) => {
    dispatchSaveDefaultChatMessage(formikGetValue('message', formik, ''));
    setFocus(false);
    if (e.currentTarget.value.trim() === '') {
      formik.setErrors({});
    }
  };

  const handleEmojiKeypress: KeyboardEventHandler<HTMLButtonElement> = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      setPickerAnchor(event.currentTarget);
      setOpenPicker((prev) => (isChatEnabled ? !prev : false));
    }
  };
  const handleEmojiButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    setPickerAnchor(event.currentTarget);
    setOpenPicker((prev) => (isChatEnabled ? !prev : false));
  };

  const renderForm = (
    <Form onSubmit={formik.handleSubmit}>
      {renderPicker()}
      <CommonTextField
        ref={messageInputReference}
        maxCharacters={MAX_CHAT_CHARS}
        showLimitAt={MAX_CHAT_CHARS / 2}
        {...formikProps('message', formik)}
        size="small"
        id={CHAT_INPUT_ID}
        placeholder={t('chat-input-placeholder')}
        label={t('chat-input-label')}
        onKeyDown={handleSubmitOnEnter}
        onFocus={() => setFocus(true)}
        onBlur={handleFormBlur}
        slotProps={{
          input: {
            readOnly: !isChatEnabled || freezeChatInput,
            endAdornment: (
              <InputAdornment position="end">
                <SendMessageButton
                  aria-label={t('chat-submit-button')}
                  type="submit"
                  edge="end"
                  data-testid="send-message-button"
                  disabled={isLimitReached || !isChatEnabled || chatInputLoading}
                  parentHasFocus={hasFocus}
                  parentDisabled={!isChatEnabled}
                >
                  {chatInputLoading ? <CircularProgress size={24} /> : <SendMessageIcon />}
                </SendMessageButton>
              </InputAdornment>
            ),
            startAdornment: (
              <InputAdornment position="start">
                <EmojiIconButton
                  ref={emojiButton}
                  onClick={handleEmojiButtonClick}
                  onKeyDown={handleEmojiKeypress}
                  onKeyUp={handleEmojiKeypress}
                  type="button"
                  edge="start"
                  disabled={!isChatEnabled}
                  parentHasFocus={hasFocus}
                  parentDisabled={!isChatEnabled}
                >
                  <EmojiIcon />
                  <VisuallyHiddenTitle component="span" label={`chat-${openPicker ? 'close' : 'open'}-emoji-picker`} />
                </EmojiIconButton>
              </InputAdornment>
            ),
          },
          inputLabel: {
            sx: { fontWeight: theme.typography.fontWeightRegular },
          },
        }}
        maxRows={3}
        multiline
        fullWidth
      />
      {isLimitReached && hasPositiveDelayMs && (
        <ErrorFormMessage
          helperText={t('chat-error-too-many-requests', { seconds: Math.round(chatSlowDownDelay.delayMs / 1000) })}
        />
      )}
    </Form>
  );

  if (!isChatEnabled) {
    return (
      <Tooltip title={t('chat-disabled-tooltip')} placement="top">
        {renderForm}
      </Tooltip>
    );
  }

  return renderForm;
};

export default ChatForm;
