// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, IconButton, InputAdornment, Stack, Typography, styled } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { HiddenIcon, VisibleIcon } from '../../../assets/icons';
import { CommonTextField } from '../../../commonComponents';
import { formikProps } from '../../../utils/formikUtils';
import LobbyLayout from '../../LobbyLayout';

const Subtext = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.disabled,
}));

// Mirrors the bottom action bar of the SelfTest lobby so the password entry sits in the same place
// as the media controls + join button.
const BottomBar = styled('nav')(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2),
  bottom: 0,
  left: 0,
  position: 'relative',
  [theme.breakpoints.up('md')]: {
    position: 'absolute',
    height: theme.typography.pxToRem(112),
  },
}));

const PasswordField = styled(CommonTextField)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    minWidth: theme.typography.pxToRem(220),
  },
  [theme.breakpoints.up('md')]: {
    '& .MuiFormHelperText-root': {
      position: 'absolute',
      top: '100%',
      margin: theme.spacing(0.5, 0, 0),
    },
  },
}));

const PASSWORD_STEP_FORM_ID = 'lobby-password-step-form';

interface LobbyPasswordStepProps {
  initialPassword?: string;
  isSubmitting?: boolean;
  onSubmit: (password: string) => void;
}

const LobbyPasswordStep = ({ initialPassword = '', isSubmitting = false, onSubmit }: LobbyPasswordStepProps) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: { password: initialPassword },
    validateOnMount: true,
    validationSchema: yup.object({
      password: yup.string().required(t('field-error-required', { fieldName: t('global-password') })),
    }),
    onSubmit: (values) => {
      onSubmit(values.password);
    },
  });

  return (
    <LobbyLayout
      center={
        <>
          <Typography variant="h1" textAlign="center" fontSize="2.9rem" lineHeight="2.9rem" mb={2} component="h1">
            {t('lobby-password-step-heading')}
          </Typography>
          <Subtext textAlign="center" fontSize="1.37rem" padding="0 0.5rem">
            {t('lobby-password-step-subtext')}
          </Subtext>
        </>
      }
      bottom={
        <BottomBar>
          <Stack
            id={PASSWORD_STEP_FORM_ID}
            component="form"
            onSubmit={formik.handleSubmit}
            aria-label={t('lobby-password-step-heading') as string}
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'center', alignItems: 'center' }}
          >
            <PasswordField
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
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {!showPassword ? <VisibleIcon /> : <HiddenIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button type="submit" color="secondary" disabled={!formik.values.password.trim() || isSubmitting}>
              {t('global-continue')}
            </Button>
          </Stack>
        </BottomBar>
      }
    />
  );
};

export default LobbyPasswordStep;
