// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { InputAdornment, styled, useTheme } from '@mui/material';
import i18next from 'i18next';
import { ChangeEvent, ForwardedRef, forwardRef, KeyboardEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CloseIcon, SearchIcon } from '../../../assets/icons';
import { AdornmentIconButton, CommonTextField } from '../../../commonComponents';

interface EndAdornmentProps {
  onClick(): void;
  className?: string;
  hasValue?: boolean;
  parentHasFocus?: boolean;
}

interface ChatSearchProps {
  value: string;
  onChange(nextValue: string): void;
}

const SearchField = styled(CommonTextField)({
  '&': {
    marginTop: 0,
  },
  '*::-webkit-search-cancel-button': {
    display: 'none',
  },
});

const startAdornment = (
  <InputAdornment position="start">
    <SearchIcon type="decorative" />
  </InputAdornment>
);

const ClearButton = styled(({ onClick, className, hasValue, parentHasFocus }: EndAdornmentProps) => (
  <AdornmentIconButton
    type="reset"
    parentHasFocus={parentHasFocus}
    onClick={hasValue ? onClick : undefined}
    aria-label={i18next.t('global-clear')}
    className={className}
    tabIndex={0}
  >
    {hasValue && <CloseIcon />}
  </AdornmentIconButton>
))(({ theme }) => ({
  '& .MuiTouchRipple-child': {
    backgroundColor: theme.palette.secondary.lightest,
  },
  padding: theme.typography.pxToRem(8),
  left: theme.typography.pxToRem(12),
}));

const DummyBlock = styled(() => <div role="presentation" aria-hidden={true} />)(({ theme }) => ({
  width: theme.spacing(2),
  height: theme.spacing(2),
}));

const ChatSearch = (props: ChatSearchProps, ref: ForwardedRef<HTMLInputElement>) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const hasValue = props.value !== '';
  const [focused, setFocused] = useState(false);

  const onChangeMiddleware = (event: ChangeEvent<HTMLInputElement>) => {
    props.onChange(event.target.value);
  };

  const clear = () => {
    props.onChange('');
  };

  const onKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      clear();
    }
  };

  const renderEndAdornment = hasValue ? (
    <InputAdornment position="end">
      <ClearButton onClick={clear} hasValue={hasValue} parentHasFocus={focused} />
    </InputAdornment>
  ) : (
    <DummyBlock />
  );
  return (
    <SearchField
      inputRef={ref}
      size="small"
      label={t('chat-search-label')}
      placeholder={t('chat-search-placeholder')}
      type="search"
      fullWidth={true}
      multiline
      // We have to use empty adornment in order to keep layout persistant when clear icon changes visibility.
      InputProps={{ startAdornment: startAdornment, endAdornment: renderEndAdornment }}
      value={props.value}
      onChange={onChangeMiddleware}
      onKeyUp={onKeyUp}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      InputLabelProps={{ sx: { fontWeight: theme.typography.fontWeightRegular } }}
    />
  );
};

export default forwardRef(ChatSearch);
