// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Avatar,
  Divider,
  FormGroup,
  MenuList,
  FormControlLabel as MuiFormControlLabel,
  MenuItem as MuiMenuItem,
  Stack,
  Typography,
  styled,
} from '@mui/material';
import { ConnectionState } from 'livekit-client';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { CloseIcon, MicOnIcon, SettingsIcon } from '../../../assets/icons';
import { CommonSwitch } from '../../../commonComponents';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import useMediaDevice from '../../../hooks/useMediaDevice';
import { setBackgroundEffects, switchActiveDevice, switchLocalDevice } from '../../../store/commonActions';
import { selectVideoBackgrounds } from '../../../store/slices/configSlice';
import {
  selectLivekitRoom,
  selectQualityCap,
  selectVideoBackgroundEffects,
  selectVideoDeviceId,
  setDisableRemoteVideos,
} from '../../../store/slices/livekitSlice';
import { mirroredVideoSet, selectMirroredVideoEnabled } from '../../../store/slices/uiSlice';
import { VideoSetting } from '../../../types';
import { DeviceId } from '../../../types/device';
import { isBackgroundEffectSupported } from '../../../utils/mediaUtils';
import { MenuSectionTitle } from '../../Toolbar/fragments/ToolbarMenuUtils';
import DeviceManager from './DeviceManager';
import { DevicePermissionState } from './constants';

const MenuItem = styled(MuiMenuItem)({
  '&.MuiMenuItem-root:hover': {
    backgroundColor: 'transparent',
  },
});

const FormControlLabel = styled(MuiFormControlLabel)({
  flex: 1,
  margin: 0,
  justifyContent: 'space-between',
});

const BackgroundOptionsContainer = styled(Stack)(({ theme }) => ({
  margin: theme.spacing(0.5, 1.5),
}));

const VideoBackgroundImage = styled(Avatar, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>(({ active, theme }) => ({
  aspectRatio: '16/9',
  height: '4.5rem',
  width: 'auto',
  cursor: 'pointer',
  borderRadius: active ? theme.borderRadius.small : 0,
  outline: ` ${active ? '3px' : 0} solid ${theme.palette.secondary.main}`,
}));

const BackgroundImageList = styled(MenuList)(({ theme }) => ({
  margin: theme.spacing(2, 2, 0),
  display: 'grid',
  justifyContent: 'space-evenly',
  gridTemplateColumns: 'repeat(3, auto)',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, auto)',
  },
  gridGap: theme.spacing(2),
}));

const BackgroundImageItem = styled(MenuItem)(({ theme }) => ({
  width: 'fit-content',
  padding: 0,
  '&.Mui-focusVisible': {
    '& > .MuiAvatar-root': {
      outline: theme.palette.focus.outline,
      outlineOffset: theme.palette.focus.outlineOffset,
    },
  },
}));

const ClearBackground = styled(VideoBackgroundImage)(({ theme }) => ({
  border: `1px solid ${theme.palette.primary.main}`,
  backgroundColor: theme.palette.background.highlight.primary,
  color: theme.palette.background.highlight.contrastText,
}));

// It is a dummy component, for future extension of the meeting settings dialog
const CameraSettingsPanel = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const videoBackgroundEffects = useAppSelector(selectVideoBackgroundEffects);
  const videoDeviceId = useAppSelector(selectVideoDeviceId);
  const mirroringEnabled = useAppSelector(selectMirroredVideoEnabled);
  const videoBackgrounds = useAppSelector(selectVideoBackgrounds);
  const qualityCap = useAppSelector(selectQualityCap);
  const room = useAppSelector(selectLivekitRoom);

  const areParticipantVideosEnabled = qualityCap !== VideoSetting.Off;

  const { localDevices: devices, permissionDenied, loadLocalDevices } = useMediaDevice({ kind: 'videoinput' });

  // Some browsers (e.g. Firefox) duplicate devices, so we need to filter them out
  const filteredDevices = useMemo(() => {
    const seenDeviceIds = new Set<string>();

    return devices
      .filter((device) => {
        if (device.deviceId === '' || seenDeviceIds.has(device.deviceId)) {
          return false;
        }
        seenDeviceIds.add(device.deviceId);
        return true;
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [devices]);

  const isBlurred = videoBackgroundEffects.style === 'blur';

  const setBlur = (enabled: boolean) => {
    dispatch(setBackgroundEffects({ style: enabled ? 'blur' : 'off' }));
  };
  const setImageBackground = (imageUrl: string) => {
    dispatch(setBackgroundEffects({ style: 'image', imageUrl }));
  };
  const toggleMirroring = () => dispatch(mirroredVideoSet(!mirroringEnabled));

  const handleSelectDevice = async (deviceId: DeviceId) => {
    if (room?.state === ConnectionState.Connected) {
      dispatch(switchActiveDevice({ kind: 'videoinput', deviceId }));
    } else {
      dispatch(switchLocalDevice({ kind: 'videoinput', deviceId }));
    }
  };

  useEffect(() => {
    loadLocalDevices();
  }, []);

  const showDeviceOptions = filteredDevices.length > 0 || permissionDenied;

  const getDevicesState = (): DevicePermissionState => {
    if (permissionDenied === true) {
      return DevicePermissionState.Denied;
    }
    if (filteredDevices.length === 0 && permissionDenied === 'pending') {
      return DevicePermissionState.Pending;
    }
    return DevicePermissionState.Confirmed;
  };

  return (
    <>
      <Typography variant="h2" alignSelf="start" pb={2}>
        {t('camera-settings-title')}
      </Typography>
      <DeviceManager
        devices={filteredDevices}
        selectedDevice={videoDeviceId as DeviceId | undefined}
        onSelectDevice={handleSelectDevice}
        subheader={{
          title: t('videomenu-choose-input'),
          titleIcon: <MicOnIcon />,
        }}
        state={getDevicesState()}
      />
      <Divider variant="middle" />

      <MenuSectionTitle sx={{ minWidth: '16rem' }}>
        <SettingsIcon />
        {t('videomenu-settings')}
      </MenuSectionTitle>
      <FormGroup>
        <BackgroundOptionsContainer spacing={1}>
          <FormControlLabel
            control={
              <CommonSwitch
                onChange={(_, enabled) => dispatch(setDisableRemoteVideos(!enabled))}
                value={areParticipantVideosEnabled}
                checked={areParticipantVideosEnabled}
                color="primary"
              />
            }
            label={
              <Typography fontWeight="normal" component="span">
                {t('videomenu-participant-videos')}
              </Typography>
            }
            labelPlacement="start"
          />
        </BackgroundOptionsContainer>
      </FormGroup>
      {showDeviceOptions && (
        <>
          <Divider variant="middle" />
          <MenuSectionTitle>{t('videomenu-background')}</MenuSectionTitle>
          <FormGroup>
            <BackgroundOptionsContainer spacing={1}>
              {isBackgroundEffectSupported() && (
                <FormControlLabel
                  control={
                    <CommonSwitch
                      onChange={(_, enabled) => setBlur(enabled)}
                      value={isBlurred}
                      checked={isBlurred}
                      color="primary"
                    />
                  }
                  label={
                    <Typography fontWeight="normal" component="span">
                      {t('videomenu-blur')}
                    </Typography>
                  }
                  labelPlacement="start"
                  disabled={videoBackgroundEffects.loading}
                />
              )}
              <FormControlLabel
                control={
                  <CommonSwitch
                    onChange={toggleMirroring}
                    value={mirroringEnabled}
                    checked={mirroringEnabled}
                    color="primary"
                  />
                }
                label={
                  <Typography fontWeight="normal" component="span">
                    {t('videomenu-mirroring')}
                  </Typography>
                }
                labelPlacement="start"
              />
            </BackgroundOptionsContainer>
          </FormGroup>
        </>
      )}

      {showDeviceOptions && isBackgroundEffectSupported() && videoBackgrounds.length > 0 && (
        <>
          <Divider variant="middle" />
          <Typography
            id="background-images-title"
            sx={{
              fontWeight: 'normal',
              px: 2,
            }}
          >
            {t('videomenu-background-images')}
          </Typography>
          <BackgroundImageList aria-labelledby="background-images-title" role="listbox">
            <BackgroundImageItem
              disabled={videoBackgroundEffects.loading}
              onClick={() => setBlur(false)}
              aria-label={t('videomenu-background-no-image')}
            >
              <ClearBackground variant="square" active={videoBackgroundEffects.style === 'off'}>
                <CloseIcon />
              </ClearBackground>
            </BackgroundImageItem>
            {videoBackgrounds.map((image) => {
              const selectedEnabled = videoBackgroundEffects.imageUrl === image.url;
              return (
                <BackgroundImageItem
                  key={image.url}
                  onClick={() => (!selectedEnabled ? setImageBackground(image.url) : setBlur(false))}
                  aria-label={image.altText}
                  disabled={videoBackgroundEffects.loading}
                >
                  <VideoBackgroundImage
                    src={image.thumb}
                    key={image.url}
                    alt={image.altText}
                    variant="square"
                    active={selectedEnabled}
                  />
                </BackgroundImageItem>
              );
            })}
          </BackgroundImageList>
        </>
      )}
    </>
  );
};

export default CameraSettingsPanel;
