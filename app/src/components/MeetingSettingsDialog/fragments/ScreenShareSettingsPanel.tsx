// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItemIcon, ListItemText, ListSubheader, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DoneIcon, ShareScreenOnIcon } from '../../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  ScreenShareResolution,
  ScreenShareResolutionValues,
  setScreenShareConfig,
} from '../../../store/slices/mediaSlice';
import DeviceListMenuItem from './DeviceListMenuItem';
import StyledMenuList from './StyledMenuList';

const OptionList = ({
  values,
  selectedKey,
  updateValue,
}: {
  values: object | string[];
  selectedKey?: string;
  updateValue: (key: string) => void;
}) => {
  const entries = Array.isArray(values) ? values.map((value) => [value, value]) : Object.entries(values);

  return entries.map(([key]) => {
    const isSelected = selectedKey === key;

    return (
      <DeviceListMenuItem
        selected={isSelected}
        key={key}
        onClick={() => updateValue(key)}
        role="menuitemradio"
        aria-checked={isSelected}
      >
        {isSelected && (
          <ListItemIcon>
            <DoneIcon data-testid="done-icon" />
          </ListItemIcon>
        )}
        <ListItemText inset={!isSelected}>
          <Typography variant="inherit" noWrap>
            {key}
          </Typography>
        </ListItemText>
      </DeviceListMenuItem>
    );
  });
};

const ScreenShareSettingsPanel = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const screenShareConfig = useAppSelector((state) => state.media.screenShareConfig);
  const [valueChanged, setValueChanged] = useState(false);

  return (
    <>
      <Typography variant="h2" alignSelf="start" pb={1}>
        {t('screen-share-panel-title')}
      </Typography>
      {valueChanged && (
        <Typography variant="body2" pb={2}>
          {t('screen-share-panel-resolution-changed')}
        </Typography>
      )}
      <StyledMenuList
        aria-labelledby="resolution-list-subheader"
        subheader={
          <>
            <ListSubheader id="resolution-list-subheader">
              <ShareScreenOnIcon />
              {t('screen-share-menu-choose-resolution')}
            </ListSubheader>
            <Typography variant="body2" mb={1}>
              {t('screen-share-menu-choose-resolution-subtitle')}
            </Typography>
          </>
        }
      >
        <OptionList
          selectedKey={screenShareConfig?.resolution}
          values={ScreenShareResolutionValues}
          updateValue={(key) => {
            dispatch(
              setScreenShareConfig({
                ...screenShareConfig,
                resolution: key as ScreenShareResolution,
              })
            );
            setValueChanged(true);
          }}
        />
      </StyledMenuList>
    </>
  );
};

export default ScreenShareSettingsPanel;
