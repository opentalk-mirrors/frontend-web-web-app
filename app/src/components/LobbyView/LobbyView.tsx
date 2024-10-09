// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Container, IconButton, InputAdornment, Grid, styled } from '@mui/material';
import { selectIsAuthenticated } from '@opentalk/redux-oidc';
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { useFormik } from 'formik';
import i18next from 'i18next';
import { uniqueId } from 'lodash';
import { SnackbarKey } from 'notistack';
import { FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';

import { ApiErrorWithBody, StartRoomError, useGetMeQuery, useGetRoomEventInfoQuery } from '../../api/rest';
import { HiddenIcon, VisibleIcon } from '../../assets/icons';
import { CommonTextField, notifications } from '../../commonComponents';
import SuspenseLoading from '../../commonComponents/SuspenseLoading/SuspenseLoading';
import Error from '../../components/Error';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useInviteCode } from '../../hooks/useInviteCode';
import useNavigateToHome from '../../hooks/useNavigateToHome';
import { useUpdateDocumentTitle } from '../../hooks/useUpdateDocumentTitle';
import { startRoom } from '../../store/commonActions';
import { selectDisallowCustomDisplayName, selectFeatures } from '../../store/slices/configSlice';
import {
  ConnectionState,
  InviteCodeErrorEnum,
  fetchRoomByInviteId,
  selectInviteState,
  selectPasswordRequired,
  selectRoomConnectionState,
} from '../../store/slices/roomSlice';
import { BreakoutRoomId, FetchRequestError } from '../../types';
import { composeRoomPath } from '../../utils/apiUtils';
import { formikProps } from '../../utils/formikUtils';
import { ContitionalToolTip } from '../ConditionalToolTip/ContitionalToolTip';
import ImprintContainer from '../ImprintContainer';
import { useMediaContext } from '../MediaProvider';
import SelfTest from '../SelfTest';

const CustomTextField = styled(CommonTextField)(({ theme }) => ({
  '& .MuiInputBase-input.Mui-disabled': {
    WebkitTextFillColor: theme.palette.secondary.main,
    backgroundColor: theme.palette.secondary.contrastText,
  },
}));

const ActionButton = styled(Button)({
  height: '100%',
});

let wrongPasswordSnackBarKey: SnackbarKey | undefined = undefined;

const showWrongPasswordNotification = () => {
  if (wrongPasswordSnackBarKey) return;
  wrongPasswordSnackBarKey = notifications.toast(`${i18next.t('joinform-wrong-room-password')}`, {
    //Unique key is used to guarantee we will show a notification if user repeatedly inputs a wrong password
    key: uniqueId(),
    variant: 'error',
    persist: true,
    onClose: () => (wrongPasswordSnackBarKey = undefined),
  });
};

const JOIN_FORM_ID = 'join-form';

const LobbyView: FC = () => {
  const dispatch = useAppDispatch();
  const mediaContext = useMediaContext();
  const { t } = useTranslation();
  const { joinWithoutMedia } = useAppSelector(selectFeatures);
  const [showPassword, setShowPassword] = useState(false);
  const { roomId, breakoutRoomId } = useParams<'roomId' | 'breakoutRoomId'>() as {
    roomId: RoomId;
    breakoutRoomId?: BreakoutRoomId;
  };
  const isLoggedIn = useAppSelector(selectIsAuthenticated);
  const { data } = useGetMeQuery(undefined, { skip: !isLoggedIn });
  const inviteCode = useInviteCode();
  const inviteState = useAppSelector(selectInviteState);
  const [inviteCodeError, setInviteCodeError] = useState<FetchRequestError>();
  const connectionState = useAppSelector(selectRoomConnectionState);
  const navigate = useNavigate();
  const navigateToHome = useNavigateToHome();
  const passwordRequired = useAppSelector(selectPasswordRequired);
  const disallowCustomDisplayName = useAppSelector(selectDisallowCustomDisplayName);
  const { data: roomData } = useGetRoomEventInfoQuery({ id: roomId, inviteCode: inviteCode }, { skip: !roomId });
  const disableDisplayNameField = disallowCustomDisplayName && !inviteCode;
  const initialDisplayName = data?.displayName || '';

  //Password is only required for guests or non invited users.
  //We do not have a way of telling if you are invited with the current backend so we will always show the password if you are using the invite link.
  const showPasswordField = passwordRequired;

  useUpdateDocumentTitle(t('joinform-room-title', { title: roomData?.title || '' }), {
    extension: '',
  });

  // Temporary request to figure out if we need to show a password field until it is added in getEventInfo request - https://git.opentalk.dev/opentalk/backend/services/controller/-/issues/603
  useEffect(() => {
    if (inviteCode && !inviteState.inviteCode) {
      dispatch(fetchRoomByInviteId(inviteCode))
        .unwrap()
        .catch((error) => setInviteCodeError(error));
    }
  }, [inviteCode]);

  //Cleans up wrong password notification on dismount
  useEffect(() => {
    return () => {
      if (wrongPasswordSnackBarKey) {
        notifications.close(wrongPasswordSnackBarKey);
        wrongPasswordSnackBarKey = undefined;
      }
    };
  }, []);

  const enterRoom = useCallback(
    async (displayName: string, password: string) => {
      if (joinWithoutMedia) {
        await mediaContext.trySetVideo(false);
        await mediaContext.trySetAudio(false);
      }

      return dispatch(
        startRoom({
          roomId,
          breakoutRoomId: breakoutRoomId || null,
          displayName,
          password,
          inviteCode,
        })
      )
        .unwrap()
        .catch((e) => {
          if ('code' in e) {
            const error = e as ApiErrorWithBody<StartRoomError>;
            switch (error.code) {
              case StartRoomError.InvalidBreakoutRoomId:
              case StartRoomError.NoBreakoutRooms:
                notifications.info(t('breakout-notification-session-ended-header'));
                navigate(composeRoomPath(roomId, inviteCode, breakoutRoomId));
                break;
              case StartRoomError.InvalidJson:
                console.error('invalid json request in startRoom', e);
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
                console.error(`unknown error code ${e.code} in startRoom`, e);
                notifications.error(t('error-general'));
            }
          } else {
            console.error('unknown error in startRoom', e);
            notifications.error(t('error-general'));
          }
        });
    },
    [navigate, t, breakoutRoomId, roomId, inviteCode, joinWithoutMedia, mediaContext]
  );

  const validationSchema = yup.object({
    name: yup
      .string()
      .trim()
      .required(t('field-error-required', { fieldName: 'Name' })),
  });

  const formik = useFormik({
    initialValues: {
      name: data?.displayName || '',
      password: '',
    },
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (isLoggedIn || inviteCode !== undefined) {
        if (disableDisplayNameField) {
          return enterRoom(initialDisplayName, values.password);
        }
        return enterRoom(values.name, values.password);
      }
    },
  });

  const disableSubmitButton =
    !(isLoggedIn || inviteCode !== undefined) || connectionState === ConnectionState.Starting || !formik.isValid;

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  if (inviteState.loading) {
    return <SuspenseLoading />;
  }

  if (inviteCodeError) {
    if (inviteCodeError?.statusText === InviteCodeErrorEnum.InvalidJson) {
      return <Error title={t('error-invalid-invitation-link')} />;
    }
    return <Error title={t('error-invite-link')} />;
  }

  return (
    <>
      <Container>
        <SelfTest
          actionButton={
            <ActionButton form={JOIN_FORM_ID} type="submit" disabled={disableSubmitButton}>
              {t('joinform-enter-now')}
            </ActionButton>
          }
          title={roomData?.title}
        >
          <Grid
            container
            item
            spacing={1}
            justifyContent="center"
            flexWrap="nowrap"
            direction="row"
            sm={12}
            md="auto"
            component="form"
            id={JOIN_FORM_ID}
            onSubmit={formik.handleSubmit}
          >
            <Grid item sm={6} md="auto">
              <ContitionalToolTip
                showToolTip={Boolean(disableDisplayNameField)}
                title={t('joinform-display-name-field-disabled-tooltip')}
                children={
                  <CustomTextField
                    {...formikProps('name', formik)}
                    color="secondary"
                    placeholder={t('global-name')}
                    autoComplete="username"
                    disabled={disableDisplayNameField}
                  />
                }
              />
            </Grid>
            {showPasswordField && (
              <Grid item sm={6} md="auto">
                <CommonTextField
                  {...formikProps('password', formik)}
                  color="secondary"
                  placeholder={t('global-password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  InputProps={{
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
                  }}
                />
              </Grid>
            )}
          </Grid>
        </SelfTest>
      </Container>
      <ImprintContainer />
    </>
  );
};

export default LobbyView;
