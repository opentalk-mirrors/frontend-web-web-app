// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Button, DialogContent, DialogTitle, Divider, IconButton, Stack, Tab, Typography, styled } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CloseIcon } from '../../../assets/icons';
import { MeetingSettings, getSettingPanels } from './settingPanels';

const DesktopSettingsDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(0),
}));

const DesktopSettingsContainer = styled(Stack)(({ theme }) => ({
  border: 'solid 1px',
  borderRadius: theme.borderRadius.medium,
  backgroundColor: theme.palette.background.default,
  '&&': { margin: 0 },
  height: '50rem',
}));

const DesktopSettingsTitle = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(3, 2, 2),
}));

const DesktopSettingsListContainer = styled(DesktopSettingsContainer)(() => ({
  width: '12rem',
}));

const DesktopSettingsPanelContainer = styled(DesktopSettingsContainer)(({ theme }) => ({
  flex: '1',
  overflow: 'auto',
  paddingBottom: theme.spacing(2),
}));

const DesktopSettingsDivider = styled(Divider)(() => ({
  '&&': { margin: 0 },
  borderRightWidth: 5,
}));

const DesktopSettingsListFooter = styled('small')(({ theme }) => ({
  padding: theme.spacing(2),
}));

const DesktopCloseButton = styled(IconButton)(() => ({
  position: 'absolute',
  right: 0,
  top: '8%',
  transform: 'translateY(-50%)',
}));

const TITLE_ID = 'desktop-settings-title-id';

interface DesktopSettingsDialogContentProps {
  onClose: () => void;
  setting: MeetingSettings;
}

const DesktopDialogContent = (props: DesktopSettingsDialogContentProps) => {
  const { t } = useTranslation();
  const { onClose, setting } = props;
  const [tabValue, setTabValue] = useState<MeetingSettings>(setting);

  const handleChange = (event: React.SyntheticEvent, newValue: MeetingSettings) => {
    setTabValue(newValue);
  };

  const title = t('meeting-settings-title');
  const settingPanels = getSettingPanels();

  return (
    <>
      {/* We use DialogTitle only for internal labeling of the parent Dialog by the MUI */}
      <DialogTitle sx={visuallyHidden} aria-hidden={true}>
        {title}
      </DialogTitle>
      <DesktopSettingsDialogContent>
        <TabContext value={tabValue}>
          <Stack direction="row" spacing={5} sx={{ overflow: 'hidden' }}>
            <DesktopSettingsListContainer direction="column">
              <DesktopSettingsTitle variant="h2" id={TITLE_ID}>
                {title}
              </DesktopSettingsTitle>
              <TabList onChange={handleChange} orientation="vertical" aria-labelledby={TITLE_ID} sx={{ flexGrow: '1' }}>
                {settingPanels.map(({ value }) => (
                  <Tab
                    key={value}
                    value={value}
                    label={t(`${value}-panel-title`)}
                    // we need to use Button component to address the `autoFocus` property
                    component={Button}
                    //  eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus={value === tabValue}
                  />
                ))}
              </TabList>
              <DesktopSettingsListFooter>{`OpenTalk ${window.config.version?.product || t('dev-version')}`}</DesktopSettingsListFooter>
            </DesktopSettingsListContainer>
            <DesktopSettingsDivider orientation="vertical" />
            <DesktopSettingsPanelContainer>
              <DesktopCloseButton aria-label={t('global-close-dialog')} onClick={onClose}>
                <CloseIcon />
              </DesktopCloseButton>
              {settingPanels.map(({ value: title, component }) => (
                <TabPanel key={title} value={title} style={{ overflow: 'auto' }}>
                  {component}
                </TabPanel>
              ))}
            </DesktopSettingsPanelContainer>
          </Stack>
        </TabContext>
      </DesktopSettingsDialogContent>
    </>
  );
};

export default DesktopDialogContent;
