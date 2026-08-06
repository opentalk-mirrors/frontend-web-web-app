// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Container, IconButton, InputAdornment, Stack, styled } from '@mui/material';
import { selectIsAuthenticated } from '@opentalk/redux-oidc';
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { useFormik } from 'formik';
import i18next from 'i18next';
import { isE2EESupported } from 'livekit-client';
import { uniqueId } from 'lodash';
import { SnackbarKey } from 'notistack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';

import { isApiError, StartRoomError, useGetMeQuery, useGetRoomEventInfoQuery } from '../../api/rest';
import {
  enterRoom as enterRoomCommand,
  enterWaitingRoom as enterWaitingRoomCommand,
} from '../../api/types/outgoing/core';
import { HiddenIcon, VisibleIcon } from '../../assets/icons';
import { CommonTextField as DefaultCommonTextField, notifications } from '../../commonComponents';
import SuspenseLoading from '../../commonComponents/SuspenseLoading/SuspenseLoading';
import { DISPLAY_NAME_MAX_CHARACTERS } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useDisplayName } from '../../hooks/useDisplayName';
import { useInviteCode } from '../../hooks/useInviteCode';
import useNavigateToHome from '../../hooks/useNavigateToHome';
import { useUpdateDocumentTitle } from '../../hooks/useUpdateDocumentTitle';
import log from '../../logger';
import { ConnectionState } from '../../modules/WebRTC/ConferenceRoom';
import { changeMedia, startRoom } from '../../store/commonActions';
import { selectDisallowCustomDisplayName, selectConfigFeatures } from '../../store/slices/configSlice';
import {
  InviteCodeErrorEnum,
  fetchRoomByInviteId,
  selectCanEnter,
  selectInviteState,
  selectLobbyDisplayName,
  selectPasswordRequired,
  selectRoomConnectionState,
} from '../../store/slices/roomSlice';
import { setDisplayName } from '../../store/slices/userSlice';
import { FetchRequestError } from '../../types';
import { composeRoomPath } from '../../utils/apiUtils';
import { formikProps } from '../../utils/formikUtils';
import { ConditionalToolTip } from '../ConditionalToolTip/ConditionalToolTip';
import OpentalkError from '../Error';
import ImprintContainer from '../ImprintContainer';
import SelfTest from '../SelfTest';

const CommonTextField = styled(DefaultCommonTextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    '&:not(&.Mui-focused)': {
      // backgroundColor: theme.palette.text.primary,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.primary.contrastText,
    '&.Mui-error': {
      color: theme.palette.primary.contrastText,
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.text.primary,
  },
}));

const CustomTextField = styled(CommonTextField)(({ theme }) => ({
  maxWidth: theme.typography.pxToRem(235),
  [theme.breakpoints.up('sm')]: {
    minWidth: theme.typography.pxToRem(220),
  },
  [theme.breakpoints.up('md')]: {
    '& .MuiFormHelperText-root': {
      position: 'absolute',
      bottom: `-${theme.typography.pxToRem(24)}`,
    },
  },
  '& .MuiInputBase-input.Mui-disabled': {
    WebkitTextFillColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.contrastText,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  height: '100%',
  [theme.breakpoints.up('md')]: {
    marginTop: `${theme.typography.pxToRem(4)} !important`,
    marginRight: 'auto !important',
    alignSelf: 'center',
  },
}));

let wrongPasswordSnackBarKey: SnackbarKey | undefined = undefined;

const showWrongPasswordNotification = () => {
  if (wrongPasswordSnackBarKey) {
    return;
  }
  wrongPasswordSnackBarKey = notifications.toast(`${i18next.t('joinform-wrong-room-password')}`, {
    //Unique key is used to guarantee we will show a notification if user repeatedly inputs a wrong password
    key: uniqueId(),
    variant: 'error',
    ariaLive: 'assertive',
    persist: true,
    onClose: () => {
      wrongPasswordSnackBarKey = undefined;
    },
  });
};

const closeWrongPasswordNotification = () => {
  if (wrongPasswordSnackBarKey) {
    notifications.close(wrongPasswordSnackBarKey);
    wrongPasswordSnackBarKey = undefined;
  }
};

const JOIN_FORM_ID = 'join-form';

const LobbyView = () => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const inviteState = useAppSelector(selectInviteState);
  const { joinWithoutMedia } = useAppSelector(selectConfigFeatures);
  const disallowCustomDisplayName = useAppSelector(selectDisallowCustomDisplayName);
  const isLoggedIn = useAppSelector(selectIsAuthenticated);
  const connectionState = useAppSelector(selectRoomConnectionState);
  const canEnter = useAppSelector(selectCanEnter);
  const lobbyDisplayName = useAppSelector(selectLobbyDisplayName);
  const showPasswordField = useAppSelector(selectPasswordRequired);
  const inviteStateCode = inviteState.inviteCode;

  const { data } = useGetMeQuery(undefined, { skip: !isLoggedIn });
  const navigateToHome = useNavigateToHome();
  const inviteCode = useInviteCode();
  const navigate = useNavigate();

  const [inviteCodeError, setInviteCodeError] = useState<FetchRequestError>();
  const [showPassword, setShowPassword] = useState(false);

  const { roomId } = useParams<'roomId'>() as {
    roomId: RoomId;
  };

  const {
    data: roomData,
    error: roomDataError,
    isLoading: isRoomDataLoading,
  } = useGetRoomEventInfoQuery({ id: roomId, inviteCode: inviteCode }, { skip: !roomId });

  if (roomData?.e2eEncryption && !isE2EESupported()) {
    notifications.error(t('unsupported-browser-e2e-encryption-dialog-message'));
  }

  useUpdateDocumentTitle(t('joinform-room-title', { title: roomData?.title || '' }), {
    extension: '',
  });

  // Temporary request to figure out if we need to show a password field until it is added in getEventInfo request - https://git.opentalk.dev/opentalk/backend/services/controller/-/issues/603
  useEffect(() => {
    if (inviteCode && !inviteStateCode) {
      dispatch(fetchRoomByInviteId(inviteCode))
        .unwrap()
        .catch((error) => setInviteCodeError(error));
    }
  }, [dispatch, inviteCode, inviteStateCode]);

  //Cleans up wrong password notification on dismount
  useEffect(() => {
    return () => {
      closeWrongPasswordNotification();
    };
  }, []);

  const disableDisplayNameField = disallowCustomDisplayName && !inviteCode;
  const initialDisplayName = useDisplayName(data);

  const validationSchema = useMemo(
    () =>
      yup.object({
        name: yup
          .string()
          .trim()
          .max(DISPLAY_NAME_MAX_CHARACTERS, t('lobby-name-max-error', { max: DISPLAY_NAME_MAX_CHARACTERS }))
          .required(t('field-error-required', { fieldName: 'Name' })),
        password: showPasswordField
          ? yup.string().required(t('field-error-required', { fieldName: t('global-password') }))
          : yup.string(),
      }),
    [t, showPasswordField]
  );

  const openLobbyConnection = useCallback(
    async (password?: string, displayName?: string) => {
      if (joinWithoutMedia) {
        dispatch(changeMedia({ kind: 'audioinput', enabled: false }));
        dispatch(changeMedia({ kind: 'videoinput', enabled: false }));
      }
      try {
        const result = await dispatch(
          startRoom({
            roomId,
            displayName: displayName || initialDisplayName || '',
            inviteCode,
            password,
          })
        ).unwrap();
        closeWrongPasswordNotification();
        return result;
      } catch (e: unknown) {
        if (isApiError<StartRoomError>(e)) {
          switch (e.code) {
            case StartRoomError.InvalidBreakoutRoomId:
            case StartRoomError.NoBreakoutRooms:
              notifications.info(t('breakout-notification-session-ended-header'));
              navigate(composeRoomPath(roomId, inviteCode));
              break;
            case StartRoomError.InvalidJson:
              log.error('invalid json request in startRoom', e);
              notifications.error(t('error-general'));
              break;
            case StartRoomError.WrongRoomPassword:
            case StartRoomError.InvalidCredentials:
              showWrongPasswordNotification();
              break;
            case StartRoomError.NotFound:
              notifications.error(t('joinform-room-not-found'));
              navigateToHome();
              break;
            case StartRoomError.Forbidden:
              notifications.error(t('joinform-access-denied'));
              navigateToHome();
              break;
            case StartRoomError.BadRequest:
              notifications.error(t('error-invalid-invitation-code'));
              navigateToHome();
              break;
            default:
              log.error(`unknown error code ${e.code} in startRoom`, e);
              notifications.error(t('error-general'));
          }
        } else {
          log.error('unknown error in startRoom', e);
          notifications.error(t('error-general'));
        }
      }
    },
    [navigate, t, roomId, inviteCode, dispatch, navigateToHome, joinWithoutMedia, initialDisplayName]
  );

  const submitLobby = useCallback(
    (displayName?: string) => {
      if (canEnter) {
        dispatch(enterRoomCommand.action({ displayName }));
      } else {
        dispatch(enterWaitingRoomCommand.action({ displayName }));
      }
    },
    [dispatch, canEnter]
  );

  // When the guest submits a password-protected room, the `/start` request is deferred until submit
  // TODO: remove with https://git.opentalk.dev/opentalk/product/tickets/-/work_items/333
  const pendingEnter = useRef<{ displayName?: string } | undefined>(undefined);

  useEffect(() => {
    if (connectionState !== ConnectionState.Lobby || !pendingEnter.current) {
      return;
    }
    const { displayName } = pendingEnter.current;
    pendingEnter.current = undefined;

    // don't send a displayName if the server already assigned one
    submitLobby(lobbyDisplayName ? undefined : displayName);
  }, [connectionState, lobbyDisplayName, submitLobby]);

  const hasInitiatedConnect = useRef(false);
  useEffect(() => {
    if (hasInitiatedConnect.current || inviteState.loading || isRoomDataLoading || !roomData) {
      return;
    }
    if (!(isLoggedIn || inviteCode !== undefined)) {
      return;
    }
    if (connectionState !== ConnectionState.Initial && connectionState !== ConnectionState.Setup) {
      return;
    }

    // For password-protected rooms wait for the guest to submit the password before opening the
    // connection, otherwise the initial `/start` request fails with a wrong-password error
    // TODO: remove with https://git.opentalk.dev/opentalk/product/tickets/-/work_items/333
    if (showPasswordField) {
      return;
    }
    hasInitiatedConnect.current = true;
    void openLobbyConnection();
  }, [
    inviteState.loading,
    isRoomDataLoading,
    roomData,
    isLoggedIn,
    inviteCode,
    connectionState,
    openLobbyConnection,
    showPasswordField,
  ]);

  const formik = useFormik({
    initialValues: {
      name: lobbyDisplayName ?? initialDisplayName ?? '',
      password: '',
    },
    enableReinitialize: true,
    validateOnMount: true,
    validationSchema,
    onSubmit: (values) => {
      if (!(isLoggedIn || inviteCode !== undefined)) {
        return;
      }
      const name = disableDisplayNameField ? initialDisplayName || '' : values.name;
      // Password-protected rooms defer the initial `/start` request until the guest submits the password,
      // so open the connection here instead of sending the websocket enter command
      // TODO: remove with https://git.opentalk.dev/opentalk/product/tickets/-/work_items/333
      if (connectionState !== ConnectionState.Lobby) {
        dispatch(setDisplayName(name));
        pendingEnter.current = { displayName: name };
        void openLobbyConnection(values.password, name);
        return;
      }
      // don't send a displayName if its already set by the server (via display_name_assigned` or returned in `joined_lobby`)
      if (lobbyDisplayName) {
        submitLobby();
        return;
      }
      dispatch(setDisplayName(name));
      submitLobby(name);
    },
  });

  const isInLobby = connectionState === ConnectionState.Lobby;

  // TODO: remove with https://git.opentalk.dev/opentalk/product/tickets/-/work_items/333
  const isAwaitingPasswordStart =
    showPasswordField &&
    (connectionState === ConnectionState.Setup || connectionState === ConnectionState.FailedCredentials);
  const isStarting = connectionState === ConnectionState.Starting;

  const disableSubmitButton = !formik.isValid || isStarting || (!isInLobby && !isAwaitingPasswordStart);
  const submitButtonLabel = isInLobby && canEnter === false ? t('joinform-request-to-join') : t('joinform-enter-now');

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  if (inviteState.loading || isRoomDataLoading) {
    return <SuspenseLoading />;
  }

  const isRoomAccessForbidden = roomDataError && 'status' in roomDataError && roomDataError.status === 403;
  if (isRoomAccessForbidden) {
    return <OpentalkError title={t('error-access-forbidden')} />;
  }

  if (inviteCodeError) {
    if (inviteCodeError?.statusText === InviteCodeErrorEnum.InvalidJson) {
      return <OpentalkError title={t('error-invalid-invitation-link')} />;
    }
    return <OpentalkError title={t('error-invite-link')} />;
  }

  return (
    <>
      <Container>
        <SelfTest
          actionButton={
            <ActionButton form={JOIN_FORM_ID} type="submit" disabled={disableSubmitButton} color="secondary">
              {submitButtonLabel}
            </ActionButton>
          }
        >
          <Stack
            id={JOIN_FORM_ID}
            direction="row"
            spacing={1}
            component="form"
            onSubmit={formik.handleSubmit}
            aria-label={t('joinform-title') as string}
          >
            <ConditionalToolTip
              showToolTip={Boolean(disableDisplayNameField)}
              title={t('joinform-display-name-field-disabled-tooltip')}
            >
              <CustomTextField
                {...formikProps('name', formik)}
                label={t('global-name')}
                placeholder={t('lobby-name-placeholder')}
                autoComplete="username"
                disabled={disableDisplayNameField || Boolean(lobbyDisplayName)}
              />
            </ConditionalToolTip>
            {showPasswordField && (
              <CommonTextField
                {...formikProps('password', formik)}
                label={t('global-password')}
                placeholder={t('lobby-password-placeholder')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={t('toggle-password-visibility')}
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {!showPassword ? <VisibleIcon /> : <HiddenIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          </Stack>
        </SelfTest>
      </Container>
      <ImprintContainer />
    </>
  );
};

export default LobbyView;
