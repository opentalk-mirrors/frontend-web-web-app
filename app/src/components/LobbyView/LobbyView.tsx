// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Container, Stack, styled } from '@mui/material';
import { selectIsAuthenticated } from '@opentalk/redux-oidc';
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { useFormik } from 'formik';
import i18next from 'i18next';
import { isE2EESupported } from 'livekit-client';
import { uniqueId } from 'lodash';
import { SnackbarKey } from 'notistack';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';

import { isApiError, StartRoomError, useGetMeQuery, useGetRoomEventInfoQuery } from '../../api/rest';
import {
  enterRoom as enterRoomCommand,
  enterWaitingRoom as enterWaitingRoomCommand,
} from '../../api/types/outgoing/core';
import {
  CommonTextField as DefaultCommonTextField,
  ConditionalToolTip,
  notifications,
  SuspenseLoading,
} from '../../commonComponents';
import { DISPLAY_NAME_MAX_CHARACTERS } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useDisplayName } from '../../hooks/useDisplayName';
import useNavigateToHome from '../../hooks/useNavigateToHome';
import { useUpdateDocumentTitle } from '../../hooks/useUpdateDocumentTitle';
import log from '../../logger';
import { ConnectionState } from '../../modules/WebRTC/ConferenceRoom';
import { changeMedia, startRoom } from '../../store/commonActions';
import { selectDisallowCustomDisplayName, selectConfigFeatures } from '../../store/slices/configSlice';
import {
  selectCanEnter,
  selectIsRoomDeleted,
  selectLobbyDisplayName,
  selectRoomConnectionState,
} from '../../store/slices/roomSlice';
import { setDisplayName } from '../../store/slices/userSlice';
import { composeRoomPath } from '../../utils/apiUtils';
import { formikProps } from '../../utils/formikUtils';
import OpentalkError from '../Error';
import ImprintContainer from '../ImprintContainer';
import MeetingEndedDialog from '../MeetingView/fragments/MeetingEndedDialog';
import SelfTest from '../SelfTest';
import LobbyPasswordStep from './fragments/LobbyPasswordStep';

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

const PASSWORD_STEP_CONNECTION_STATES = [
  ConnectionState.Initial,
  ConnectionState.Setup,
  ConnectionState.Starting,
  ConnectionState.Left,
  ConnectionState.FailedCredentials,
];

const LobbyView = () => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const { joinWithoutMedia } = useAppSelector(selectConfigFeatures);
  const disallowCustomDisplayName = useAppSelector(selectDisallowCustomDisplayName);
  const isLoggedIn = useAppSelector(selectIsAuthenticated);
  const connectionState = useAppSelector(selectRoomConnectionState);
  const canEnter = useAppSelector(selectCanEnter);
  const lobbyDisplayName = useAppSelector(selectLobbyDisplayName);
  const isRoomDeleted = useAppSelector(selectIsRoomDeleted);

  const { data } = useGetMeQuery(undefined, { skip: !isLoggedIn });
  const navigateToHome = useNavigateToHome();
  const navigate = useNavigate();

  const { roomId } = useParams<'roomId'>() as {
    roomId: RoomId;
  };

  const {
    data: roomData,
    error: roomDataError,
    isLoading: isRoomDataLoading,
  } = useGetRoomEventInfoQuery({ id: roomId }, { skip: !roomId });

  const isPasswordRequired = Boolean(roomData?.passwordRequired);
  const showPasswordStep = isPasswordRequired && PASSWORD_STEP_CONNECTION_STATES.includes(connectionState);

  if (roomData?.e2eEncryption && !isE2EESupported()) {
    notifications.error(t('unsupported-browser-e2e-encryption-dialog-message'));
  }

  useUpdateDocumentTitle(t('joinform-room-title', { title: roomData?.title || '' }), {
    extension: '',
  });

  //Cleans up wrong password notification on dismount
  useEffect(() => {
    return () => {
      closeWrongPasswordNotification();
    };
  }, []);

  const disableDisplayNameField = disallowCustomDisplayName && isLoggedIn;
  const initialDisplayName = useDisplayName(data);

  const validationSchema = useMemo(
    () =>
      yup.object({
        name: yup
          .string()
          .trim()
          .max(DISPLAY_NAME_MAX_CHARACTERS, t('lobby-name-max-error', { max: DISPLAY_NAME_MAX_CHARACTERS }))
          .required(t('field-error-required', { fieldName: 'Name' })),
      }),
    [t]
  );

  const openLobbyConnection = useCallback(
    async (passwordValue?: string, displayName?: string) => {
      if (isRoomDeleted) {
        return;
      }
      if (joinWithoutMedia) {
        dispatch(changeMedia({ kind: 'audioinput', enabled: false }));
        dispatch(changeMedia({ kind: 'videoinput', enabled: false }));
      }
      try {
        await dispatch(
          startRoom({
            roomId,
            displayName: displayName || initialDisplayName || '',
            password: passwordValue,
          })
        ).unwrap();
        closeWrongPasswordNotification();
      } catch (e: unknown) {
        if (isApiError<StartRoomError>(e)) {
          switch (e.code) {
            case StartRoomError.InvalidBreakoutRoomId:
            case StartRoomError.NoBreakoutRooms:
              notifications.info(t('breakout-notification-session-ended-header'));
              navigate(composeRoomPath(roomId));
              break;
            case StartRoomError.InvalidJson:
              log.error('invalid json request in startRoom', e);
              notifications.error(t('error-general'));
              break;
            case StartRoomError.WrongRoomPassword:
              // Keep the guest on the password step so they can re-enter the password.
              showWrongPasswordNotification();
              break;
            case StartRoomError.NotFound:
              notifications.error(t('joinform-room-not-found'));
              if (!isRoomDeleted) {
                navigateToHome();
              }
              break;
            case StartRoomError.Forbidden:
              notifications.error(t('joinform-access-denied'));
              if (!isRoomDeleted) {
                navigateToHome();
              }
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
    [navigate, t, roomId, dispatch, navigateToHome, joinWithoutMedia, initialDisplayName, isRoomDeleted]
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

  const hasInitiatedConnect = useRef(false);
  useEffect(() => {
    if (hasInitiatedConnect.current || isRoomDataLoading || !roomData) {
      return;
    }
    // On successful hangup the connection state will be `Left`
    const canInitiateStart =
      connectionState === ConnectionState.Initial ||
      connectionState === ConnectionState.Setup ||
      connectionState === ConnectionState.Left;
    if (!canInitiateStart) {
      return;
    }

    // Password-protected rooms open the connection from the dedicated password step instead, so the
    // password can be passed to the initial `/start` request.
    if (isPasswordRequired) {
      return;
    }
    hasInitiatedConnect.current = true;
    void openLobbyConnection();
  }, [isRoomDataLoading, roomData, connectionState, openLobbyConnection, isPasswordRequired, isRoomDeleted]);

  const formik = useFormik({
    initialValues: {
      name: lobbyDisplayName ?? initialDisplayName ?? '',
    },
    enableReinitialize: true,
    validateOnMount: true,
    validationSchema,
    onSubmit: (values) => {
      const name = disableDisplayNameField ? initialDisplayName || '' : values.name;
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
  const isStarting = connectionState === ConnectionState.Starting;

  const disableSubmitButton = !formik.isValid || !isInLobby;
  const submitButtonLabel = isInLobby && canEnter === false ? t('joinform-request-to-join') : t('joinform-enter-now');

  if (isRoomDataLoading) {
    return <SuspenseLoading />;
  }

  const isRoomAccessForbidden = roomDataError && 'status' in roomDataError && roomDataError.status === 403;
  if (isRoomAccessForbidden) {
    return <OpentalkError title={t('error-access-forbidden')} />;
  }

  // A guest trying to join a room with guest access disabled receives a 401 from the room event endpoint.
  // Logging in might grant them access, so offer a login option unless they are already authenticated.
  const isRoomAccessUnauthorized = roomDataError && 'status' in roomDataError && roomDataError.status === 401;
  if (isRoomAccessUnauthorized) {
    return <OpentalkError title={<Trans i18nKey="error-unauthorized" />} login={!isLoggedIn} />;
  }

  if (showPasswordStep) {
    return (
      <>
        <LobbyPasswordStep
          isSubmitting={isStarting}
          onSubmit={(enteredPassword) => {
            void openLobbyConnection(enteredPassword);
          }}
        />
        <ImprintContainer />
      </>
    );
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
          </Stack>
        </SelfTest>
      </Container>
      {isRoomDeleted && <MeetingEndedDialog />}
      <ImprintContainer />
    </>
  );
};

export default LobbyView;
