// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  styled,
  MenuItem,
  Container,
  SelectChangeEvent,
  DialogTitle,
  DialogContent,
  Stack,
  IconButton,
} from '@mui/material';
import { useState, ChangeEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

import { CloseIcon } from '../../../assets/icons';
import { CommonTextField } from '../../../commonComponents';
import { getSettingPanels, MeetingSettings } from './settingPanels';

const MobileSettingsDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(0),
}));

const MobileSettingsDialogTitle = styled(DialogTitle)(({ theme }) => ({
  borderTopLeftRadius: theme.borderRadius.medium,
  borderTopRightRadius: theme.borderRadius.medium,
  backgroundColor: theme.palette.background.customPaper.primary,
  paddingLeft: theme.spacing(2),
}));

const MobileCloseButton = styled(IconButton)(() => ({
  position: 'absolute',
  right: 0,
  top: '7%',
  transform: 'translateY(-50%)',
  '& .MuiSvgIcon-root': {
    fontSize: '1rem',
  },
}));

const MobileSettingsContainer = styled(Stack)(({ theme }) => ({
  borderBottomLeftRadius: theme.borderRadius.medium,
  borderBottomRightRadius: theme.borderRadius.medium,
  backgroundColor: theme.palette.background.customPaper.primary,
  height: '25rem',
  flex: '1',
  paddingBottom: theme.spacing(2),
}));

const SettingsSelect = styled(CommonTextField)(({ theme }) => ({
  margin: theme.spacing(0, 2),
}));

const MobileSettingsPanelContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  overflow: 'scroll',
}));

const SETTINGS_PANEL_ID = 'settings-panel-id';

interface MobileSettingsDialogContentProps {
  onClose: () => void;
  setting: MeetingSettings;
}

const MobileDialogContent = (props: MobileSettingsDialogContentProps) => {
  const { t } = useTranslation();
  const { onClose, setting } = props;
  const [selectedValue, setSelectedValue] = useState<MeetingSettings>(setting);

  const settingPanels = getSettingPanels();

  const getSelectedPanel = () => {
    const selectedPanel = settingPanels.find(({ value }) => value === selectedValue);
    return selectedPanel?.component;
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event: SelectChangeEvent) => {
    if (event.target.value) {
      setSelectedValue(event.target.value as MeetingSettings);
    }
  };

  return (
    <>
      <MobileSettingsDialogTitle>{t('meeting-settings-title')}</MobileSettingsDialogTitle>
      <MobileCloseButton aria-label={t('global-close-dialog')} onClick={onClose}>
        <CloseIcon />
      </MobileCloseButton>
      <MobileSettingsDialogContent>
        <MobileSettingsContainer direction="column">
          <SettingsSelect
            select
            slotProps={{
              select: {
                SelectDisplayProps: {
                  'aria-label': t('meeting-settings-title'),
                },
                MenuProps: {
                  MenuListProps: { 'aria-controls': SETTINGS_PANEL_ID },
                },
              },
            }}
            defaultValue={setting}
            onChange={handleChange}
            aria-controls={SETTINGS_PANEL_ID}
            //  eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          >
            {settingPanels.map(({ value }) => (
              <MenuItem key={value} value={value}>
                {t(`${value}-panel-title`)}
              </MenuItem>
            ))}
          </SettingsSelect>
          <MobileSettingsPanelContainer id={SETTINGS_PANEL_ID}>{getSelectedPanel()}</MobileSettingsPanelContainer>
        </MobileSettingsContainer>
      </MobileSettingsDialogContent>
    </>
  );
};

export default MobileDialogContent;
