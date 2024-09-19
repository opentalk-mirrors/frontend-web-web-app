// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Avatar,
  Divider,
  FormGroup,
  ListItemText,
  MenuList,
  FormControlLabel as MuiFormControlLabel,
  MenuItem as MuiMenuItem,
  Stack,
  Switch,
  ThemeProvider,
  Typography,
  styled,
} from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { CameraOnIcon, CloseIcon, ErrorIcon, WarningIcon } from '../../../assets/icons';
import { createOpenTalkTheme } from '../../../assets/themes/opentalk';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { useFullscreenContext } from '../../../hooks/useFullscreenContext';
import useMediaDevice from '../../../hooks/useMediaDevice';
import browser from '../../../modules/BrowserSupport';
import { useMediaChoices } from '../../../provider/MediaChoicesProvider';
import { selectVideoBackgrounds } from '../../../store/slices/configSlice';
import { selectVideoBackgroundEffects, setBackgroundEffects } from '../../../store/slices/mediaSlice';
import { mirroredVideoSet, selectMirroredVideoEnabled } from '../../../store/slices/uiSlice';
import { DeviceId } from '../../../types/device';
import DeviceList from './DeviceList';
import { MenuSectionTitle, ToolbarMenu, ToolbarMenuProps } from './ToolbarMenuUtils';

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
  height: '3.5rem',
  width: 'auto',
  cursor: 'pointer',
  borderRadius: active ? theme.borderRadius.small : 0,
  outline: ` ${active ? '3px' : 0} solid ${theme.palette.warning.main}`,
}));

const BackgroundImageList = styled(MenuList)(({ theme }) => ({
  margin: theme.spacing(1, 2, 0),
  display: 'grid',
  justifyContent: 'space-evenly',
  gridTemplateColumns: 'repeat(3, auto)',
  gridGap: theme.spacing(2),
}));

const BackgroundImageItem = styled(MenuItem)(({ theme }) => ({
  width: 'fit-content',
  padding: 0,
  '&.Mui-focusVisible': {
    '& > .MuiAvatar-root': {
      outline: `solid ${theme.palette.primary.main}`,
    },
  },
}));

const ClearBackground = styled(VideoBackgroundImage)(({ theme }) => ({
  border: `1px solid ${theme.palette.secondary.main}`,
  backgroundColor: theme.palette.secondary.lightest,
  color: theme.palette.secondary.main,
}));

const MultilineTypography = styled(Typography)({
  whiteSpace: 'pre-wrap',
});

interface VideoMenuProps extends ToolbarMenuProps {
  videoEnabled: boolean;
  isLobby: boolean;
}

const VideoMenu = ({ anchorEl, onClose, open, isLobby }: VideoMenuProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const fullscreenHandle = useFullscreenContext();
  const mediaChoices = useMediaChoices();

  const backgroundEffects = useAppSelector(selectVideoBackgroundEffects);
  const mirroringEnabled = useAppSelector(selectMirroredVideoEnabled);
  const videoBackgrounds = useAppSelector(selectVideoBackgrounds);

  const {
    startMedia,
    localDevices: devices,
    permissionDenied,
    loadLocalDevices,
  } = useMediaDevice({ kind: 'videoinput' });

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

  const selectedDeviceId = mediaChoices?.userChoices.videoDeviceId;

  const isBrowserSafariOrFireFox = browser.isSafari() || (browser.isFirefox() && isLobby);

  const isBlurred = backgroundEffects.style === 'blur';

  const setBlur = (enabled: boolean) => {
    dispatch(setBackgroundEffects({ style: enabled ? 'blur' : 'off' }));
  };
  const setImageBackground = (imageUrl: string) => {
    dispatch(setBackgroundEffects({ style: 'image', imageUrl }));
  };
  const toggleMirroring = () => dispatch(mirroredVideoSet(!mirroringEnabled));

  const handleClick = async (deviceId: DeviceId) => {
    if (deviceId !== mediaChoices?.userChoices.videoDeviceId) {
      await startMedia(false, deviceId);
    }
  };

  useEffect(() => {
    if (open) {
      loadLocalDevices('videoinput');
    }
  }, [open]);

  const sortedDevices = filteredDevices.sort((a, b) => a.label.localeCompare(b.label));

  return (
    <ThemeProvider theme={createOpenTalkTheme()}>
      <ToolbarMenu
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: -4,
          horizontal: 'center',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        disablePortal={fullscreenHandle.active}
        id="video-context-menu"
        aria-labelledby="video-menu-title"
        role="menu"
      >
        <MenuSectionTitle id="video-menu-title" sx={{ pt: 1.5, pb: 1.5 }}>
          <CameraOnIcon />
          {t('videomenu-choose-input')}
        </MenuSectionTitle>
        {permissionDenied === true && (
          <MenuSectionTitle>
            <ErrorIcon />
            <MultilineTypography variant="body2">{t('device-permission-denied')}</MultilineTypography>
          </MenuSectionTitle>
        )}
        {filteredDevices.length === 0 && permissionDenied === 'pending' ? (
          <MenuSectionTitle>
            <WarningIcon />
            <ListItemText>{t('devicemenu-wait-for-permission')}</ListItemText>
          </MenuSectionTitle>
        ) : (
          <DeviceList
            devices={sortedDevices}
            selectedDevice={selectedDeviceId as DeviceId | undefined}
            onClick={handleClick}
            ariaLabelId="video-menu-title"
          />
        )}
        <Divider variant="middle" />
        <MenuSectionTitle>{t('videomenu-background')}</MenuSectionTitle>
        <FormGroup>
          <BackgroundOptionsContainer spacing={1}>
            {!isBrowserSafariOrFireFox && (
              <FormControlLabel
                control={<Switch onChange={(_, enabled) => setBlur(enabled)} value={isBlurred} checked={isBlurred} />}
                label={
                  <Typography fontWeight="normal">
                    {t(isBlurred ? 'videomenu-blur-on' : 'videomenu-blur-off')}
                  </Typography>
                }
                labelPlacement="start"
                disabled={backgroundEffects.loading}
              />
            )}
            <FormControlLabel
              control={<Switch onChange={toggleMirroring} value={mirroringEnabled} checked={mirroringEnabled} />}
              label={
                <Typography fontWeight="normal">
                  {t(mirroringEnabled ? 'videomenu-mirroring-on' : 'videomenu-mirroring-off')}
                </Typography>
              }
              labelPlacement="start"
            />
          </BackgroundOptionsContainer>
        </FormGroup>

        {!isBrowserSafariOrFireFox && videoBackgrounds.length > 0 && (
          <>
            <Divider variant="middle" />
            <Typography fontWeight="normal" id="background-images-title" sx={{ px: 2 }}>
              {t('videomenu-background-images')}
            </Typography>
            <BackgroundImageList aria-labelledby="background-images-title" role="listbox">
              <BackgroundImageItem
                disabled={backgroundEffects.loading}
                onClick={() => setBlur(false)}
                aria-label={t('videomenu-background-no-image')}
              >
                <ClearBackground variant="square" active={backgroundEffects.style === 'off'}>
                  <CloseIcon />
                </ClearBackground>
              </BackgroundImageItem>
              {videoBackgrounds.map((image) => {
                const selectedEnabled = backgroundEffects.imageUrl === image.url;
                return (
                  <BackgroundImageItem
                    key={image.url}
                    onClick={() => (!selectedEnabled ? setImageBackground(image.url) : setBlur(false))}
                    aria-label={image.altText}
                    disabled={backgroundEffects.loading}
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
      </ToolbarMenu>
    </ThemeProvider>
  );
};

export default VideoMenu;
