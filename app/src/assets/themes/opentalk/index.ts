// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type {} from '@mui/lab/themeAugmentation';
import { PaletteMode } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import { ThemeBasePalette } from '@opentalk/rest-api-rtk-query';

import closeSvg from '../../icons/source/close.svg';
import doneSvg from '../../icons/source/done.svg';
import { getColorSchemes } from './palette';

export function createOpenTalkTheme(mode: PaletteMode, basePalette: ThemeBasePalette) {
  const schemes = getColorSchemes(basePalette);
  const theme = createTheme({
    palette: {
      mode,
      ...schemes[mode].palette,
    },
    zIndex: {
      jumpLink: 1501,
    },
    borderRadius: {
      small: 2,
      medium: 8,
      large: 40,
      circle: '50%',
      card: 16,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            height: '100%',
            margin: 0,
            padding: 0,
          },
          body: {
            height: '100%',
            margin: 0,
            padding: 0,
            background: `url('/assets/background.svg') no-repeat`,
            backgroundSize: 'cover',
          },
          '#root': {
            height: '100%',
            display: 'flex',
          },
        },
      },
      MuiButton: {
        defaultProps: {
          color: 'primary',
          variant: 'contained',
          disableElevation: true,
          disableRipple: true,
        },

        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: theme.borderRadius.large,
            textTransform: 'none',
            ':disabled': {
              opacity: 0.5,
            },
            '&.Mui-focusVisible': {
              outline: theme.palette.focus.outline,
              outlineOffset: theme.palette.focus.outlineOffset,
            },
            variants: [
              {
                props: { variant: 'conference-inactive', disabled: true },
                style: {
                  '&.Mui-disabled': {
                    border: '2px solid currentColor',
                    opacity: 1,
                  },
                },
              },
            ],
          }),
          sizeSmall: ({ theme }) => ({
            fontSize: theme.typography.pxToRem(12),
            padding: theme.spacing(1, 2.5),
          }),
          sizeMedium: ({ theme }) => ({
            padding: theme.spacing(1.25, 2.25),
            '& .MuiButton-startIcon > *:nth-of-type(1), & .MuiButton-endIcon > *:nth-of-type(1)': {
              fontSize: theme.typography.pxToRem(14),
            },
            [theme.breakpoints.down('md')]: {
              padding: theme.spacing(1, 1.75),
              fontSize: theme.typography.pxToRem(12),
            },
          }),
          sizeLarge: ({ theme }) => ({
            fontSize: theme.typography.pxToRem(16),
            padding: theme.spacing(1.5, 2.25),
            '& .MuiButton-startIcon > *:nth-of-type(1), & .MuiButton-endIcon > *:nth-of-type(1)': {
              fontSize: theme.typography.pxToRem(20),
            },
            [theme.breakpoints.down('md')]: {
              fontSize: theme.typography.pxToRem(14),
              padding: theme.spacing(1.25, 2),
              '& .MuiButton-startIcon > *:nth-of-type(1), & .MuiButton-endIcon > *:nth-of-type(1)': {
                fontSize: theme.typography.pxToRem(16),
              },
            },
            [theme.breakpoints.down('sm')]: {
              fontSize: theme.typography.pxToRem(12),
              padding: theme.spacing(1, 1.5),
              '& .MuiButton-startIcon > *:nth-of-type(1), & .MuiButton-endIcon > *:nth-of-type(1)': {
                fontSize: theme.typography.pxToRem(14),
              },
            },
          }),
          containedPrimary: ({ theme }) => ({
            color: theme.palette.primary.contrastText,
            ':hover': {
              backgroundColor: theme.palette.primary.light,
            },
            ':disabled': {
              backgroundColor: theme.palette.primary.dark,
              color: theme.palette.primary.contrastText,
            },
            '&.MuiButtonBase-root.Mui-disabled': {
              backgroundColor: theme.palette.primary.dark,
            },
          }),
          containedSecondary: ({ theme }) => ({
            color: theme.palette.secondary.contrastText,
            ':hover': {
              backgroundColor: theme.palette.secondary.light,
            },
            ':disabled': {
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.secondary.contrastText,
            },
          }),
          outlinedSecondary: ({ theme }) => ({
            borderColor: theme.palette.secondary.main,
            ':disabled': {
              color: theme.palette.secondary.main,
            },
          }),
          containedError: ({ theme }) => ({
            ':hover': {
              backgroundColor: theme.palette.error.light,
            },
            ':disabled': {
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.secondary.contrastText,
            },
          }),
          textSecondary: {
            ':hover': {
              backgroundColor: 'unset',
            },
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: ({ theme }) => ({
            '& .mic-off-line': {
              fill: theme.palette.warning.main,
            },
          }),
        },
      },
      MuiIconButton: {
        styleOverrides: {
          sizeMedium: ({ theme }) => ({
            fontSize: theme.typography.pxToRem(20),
          }),
          sizeLarge: ({ theme }) => ({
            '& > .MuiSvgIcon-root': {
              fontSize: theme.typography.pxToRem(20),
              [theme.breakpoints.down('md')]: {
                fontSize: theme.typography.pxToRem(16),
              },
            },
          }),
          root: ({ theme }) => ({
            borderRadius: theme.borderRadius.large,
            padding: theme.spacing(1.5),
            [theme.breakpoints.down('md')]: {
              padding: theme.spacing(1.25, 1.75),
            },
            '& > .MuiSvgIcon-root': {
              fontSize: theme.typography.pxToRem(16),
              [theme.breakpoints.down('md')]: {
                fontSize: theme.typography.pxToRem(12),
              },
            },
          }),
          colorPrimary: ({ theme }) => ({
            background: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            ':hover': {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '& .MuiSvgIcon-root': {
                fill: theme.palette.primary.contrastText,
              },
            },
          }),
          colorSecondary: ({ theme }) => ({
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrastText,
            ':hover': {
              backgroundColor: theme.palette.secondary.light,
              color: theme.palette.secondary.contrastText,
            },
            ':disabled': {
              opacity: 0.5,
              backgroundColor: theme.palette.secondary.main,
            },
          }),
        },
      },
      MuiSwitch: {
        defaultProps: {
          color: 'primary',
        },
        styleOverrides: {
          root: ({ theme }) => ({
            padding: 0,
            width: theme.typography.pxToRem(46),
            height: theme.typography.pxToRem(24),
            marginRight: 0,
          }),
          switchBase: ({ theme }) => ({
            // color: theme.palette.common.white,
            padding: theme.spacing(0.25),
            '&.Mui-checked': {
              // color: theme.palette.common.white,
              '& .MuiSwitch-thumb:before': {
                backgroundColor: theme.palette.primary.contrastText,
                mask: `url("${doneSvg}")`,
                maskSize: '40%',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
              },
              '& + .MuiSwitch-track': {
                opacity: 1,
              },
            },
            '&.Mui-focusVisible': {
              backgroundColor: theme.palette.focus.color,
              transitionDuration: '100ms',
            },
            '&.Mui-disabled': {
              '& + .MuiSwitch-track': {
                opacity: 0.4,
              },
            },
          }),
          track: {
            opacity: 1,
            borderRadius: 16,
          },
          thumb: ({ theme }) => ({
            width: theme.typography.pxToRem(20),
            height: theme.typography.pxToRem(20),
            '&:before': {
              content: "''",
              position: 'absolute',
              width: '100%',
              height: '100%',
              left: 0,
              top: 0,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundColor: theme.palette.primary.contrastText,
              mask: `url("${closeSvg}")`,
              maskSize: '40%',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              backgroundSize: 8,
            },
          }),
          colorPrimary: ({ theme }) => ({
            '& + .MuiSwitch-track': {
              backgroundColor: theme.palette.background.highlight.primary,
            },
            '& .MuiSwitch-thumb': {
              backgroundColor: theme.palette.primary.light,
            },
            '&.Mui-checked + .MuiSwitch-track': {
              backgroundColor: theme.palette.primary.dark,
            },
            '&.Mui-checked .MuiSwitch-thumb': {
              backgroundColor: theme.palette.primary.light,
            },
          }),
          colorSecondary: ({ theme }) => ({
            '& + .MuiSwitch-track': {
              backgroundColor: theme.palette.background.highlightContrast.primary,
            },
            '&.Mui-checked .MuiSwitch-thumb': {
              backgroundColor: theme.palette.secondary.main,
            },
          }),
        },
      },
      MuiSlider: {
        styleOverrides: {
          thumb: ({ theme }) => ({
            color: theme.palette.secondary.main,
            boxShadow: '0 0 0 0px !important',
            '&.Mui-focusVisible': {
              backgroundColor: theme.palette.secondary.main,
              transitionDuration: '100ms',
            },
          }),
          mark: {
            width: 0,
            height: 0,
            opacity: 0,
          },
          track: ({ theme }) => ({
            color: theme.palette.primary.main,
          }),
          rail: ({ theme }) => ({
            color: theme.palette.primary.light,
          }),
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            fontSize: theme.typography.pxToRem(14),
            [theme.breakpoints.down('md')]: {
              fontSize: theme.typography.pxToRem(12),
            },
            textTransform: 'none',
          }),
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: ({ theme }) => ({
            fontWeight: 400,
            lineHeight: 'unset',
            backgroundColor: 'transparent',
            color: theme.palette.primary.contrastText,
            '&.Mui-readOnly': {
              backgroundColor: 'transparent',
              color: theme.palette.text.disabled,
            },
            '&.Mui-focused': {
              backgroundColor: theme.palette.background.highlight.primary,
              color: theme.palette.background.highlight.contrastText,
              padding: theme.spacing(0.2, 1),
            },
            '&.Mui-error': {
              color: theme.palette.primary.contrastText,
              '&.Mui-focused': {
                color: theme.palette.background.highlight.contrastText,
              },
            },
            [theme.breakpoints.down('md')]: {
              fontSize: theme.typography.pxToRem(16),
            },
          }),
          shrink: ({ theme }) => ({
            '&:not(&.Mui-focused)': {
              backgroundColor: theme.palette.background.highlight.primary,
              color: theme.palette.background.highlight.contrastText,
              padding: theme.spacing(0.2, 1),
              borderRadius: theme.borderRadius.small,
            },
          }),
        },
      },
      // we need to double the style for the inputs https://next.mui.com/x/migration/migration-pickers-v7/ -> Migrate the theme
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            // https://stackoverflow.com/questions/76228510/mui-textfield-outline-overlaps-label
            '& > fieldset > legend': {
              fontSize: `calc(0.7 * ${theme.typography.pxToRem(18)})`,
            },
            '&.Mui-focused': {
              '&:not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.focus.color,
              },
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px',
              borderColor: theme.palette.text.error,
            },
          }),
        },
      },
      // we need to double the style for the inputs https://next.mui.com/x/migration/migration-pickers-v7/ -> Migrate the theme
      MuiInputBase: {
        styleOverrides: {
          root: ({ theme }) => ({
            display: 'flex',
            borderRadius: 2,
            fontSize: theme.typography.pxToRem(16),
            fontWeight: 400,
            lineHeight: 1.25,
            [theme.breakpoints.down('md')]: {
              lineHeight: 'unset',
            },
            '& .MuiButtonBase-root.MuiIconButton-root.Mui-focusVisible': {
              outline: theme.palette.focus.outline,
            },
            variants: [
              {
                props: {
                  color: 'primary',
                },
                style: {
                  background: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '& .MuiSvgIcon-root': {
                    color: theme.palette.primary.contrastText,
                  },
                  '&.Mui-focused': {
                    backgroundColor: theme.palette.background.highlight.primary,
                    color: theme.palette.background.highlight.contrastText,
                    borderColor: theme.palette.focus.color,
                    '& .MuiSvgIcon-root': {
                      fill: theme.palette.background.highlight.contrastText,
                    },
                    '&:not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.focus.color,
                    },
                  },
                  '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                    borderWidth: '2px',
                    borderColor: theme.palette.text.error,
                  },
                },
              },
            ],
          }),
          input: ({ theme }) => ({
            padding: theme.spacing(1.5, 2),
            height: 'inherit',
            '&::placeholder': {
              color: theme.palette.text.placeholder,
            },
          }),
          multiline: {
            padding: 0,
          },
          inputAdornedStart: {
            '&&': {
              paddingLeft: 0,
            },
          },
          inputAdornedEnd: ({ theme }) => ({
            '&.MuiInputBase-input': {
              paddingRight: theme.spacing(4),
            },
          }),
          inputSizeSmall: ({ theme }) => ({
            padding: theme.spacing(1, 4, 1, 1.5),
            fontSize: theme.typography.pxToRem(14),
          }),
        },
      },
      MuiPickersInputBase: {
        styleOverrides: {
          root: ({ theme }) => ({
            display: 'flex',
            borderRadius: 2,
            fontSize: theme.typography.pxToRem(16),
            fontWeight: 400,
            lineHeight: 1.25,
            [theme.breakpoints.down('md')]: {
              lineHeight: 'unset',
            },
            variants: [
              {
                props: {
                  color: 'primary',
                },
                style: {
                  background: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '& .MuiSvgIcon-root': {
                    color: theme.palette.primary.contrastText,
                  },
                  '&.Mui-focused': {
                    backgroundColor: theme.palette.background.highlight.primary,
                    color: theme.palette.background.highlight.contrastText,
                    '& .MuiSvgIcon-root': {
                      fill: theme.palette.text.primary,
                    },
                    '& .MuiIconButton-edgeEnd:hover, & .MuiIconButton-edgeEnd:focus': {
                      backgroundColor: theme.palette.background.highlight.primary,
                      '& .MuiSvgIcon-root': {
                        fill: theme.palette.background.highlight.contrastText,
                      },
                    },
                    '&:not(.Mui-error) .MuiPickersOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.focus.color,
                    },
                  },
                  '&.Mui-error .MuiPickersOutlinedInput-notchedOutline': {
                    borderWidth: '2px',
                    borderColor: theme.palette.error.main,
                  },
                  '& .MuiIconButton-edgeEnd:hover, & .MuiIconButton-edgeEnd:focus': {
                    backgroundColor: theme.palette.primary.light,
                  },
                  '&.Mui-disabled .MuiPickersSectionList-root *': {
                    color: theme.palette.text.disabled,
                  },
                },
              },
            ],
          }),
          input: ({ theme }) => ({
            padding: theme.spacing(1.5, 2),
            height: 'inherit',
            '&::placeholder': {
              color: theme.palette.text.placeholder,
            },
          }),
          inputSizeSmall: ({ theme }) => ({
            padding: theme.spacing(1, 4, 1, 1.5),
            fontSize: theme.typography.pxToRem(14),
          }),
        },
      },
      MuiPickersOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            '& > fieldset > legend': {
              fontSize: `calc(0.7 * ${theme.typography.pxToRem(18)})`,
            },
            '& .MuiIconButton-edgeEnd:hover': {
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
            },
            '& .MuiIconButton-edgeEnd:active': {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
          }),
        },
      },
      MuiPickersSectionList: {
        styleOverrides: {
          sectionContent: {
            fontFamily: 'Opentalk !important',
          },
        },
      },
      MuiInputAdornment: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: 'inherit',
            '& .MuiSvgIcon-root': {
              fontSize: theme.typography.pxToRem(16),
              [theme.breakpoints.down('md')]: {
                fontSize: theme.typography.pxToRem(12),
              },
            },
          }),
          positionEnd: ({ theme }) => ({
            position: 'absolute',
            right: theme.spacing(2),
          }),
          positionStart: ({ theme }) => ({
            height: 0,
            padding: theme.spacing(1.5, 0.5),
            marginRight: 0,
          }),
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: ({ theme }) => ({
            marginLeft: 0,
            color: theme.palette.text.primary,
            '&.Mui-error': {
              color: theme.palette.text.error,
            },
            variants: [
              {
                props: ({ ownerState }) => ownerState.error,
                style: {
                  '&::before': {
                    content: "'!'",
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '1.25rem',
                    height: '1.25rem',
                    borderRadius: '50%',
                    backgroundColor: theme.palette.text.error,
                    color: theme.palette.getContrastText(theme.palette.text.error),
                    marginRight: theme.spacing(0.5),
                  },
                },
              },
            ],
          }),
        },
      },
      MuiStepIcon: {
        styleOverrides: {
          root: ({ theme }) => ({
            width: theme.typography.pxToRem(40),
            height: theme.typography.pxToRem(40),
            fontWeight: 500,
            [theme.breakpoints.down('md')]: {
              width: theme.typography.pxToRem(32),
              height: theme.typography.pxToRem(32),
            },
          }),
          text: ({ theme }) => ({
            fill: theme.palette.primary.contrastText,
          }),
        },
      },
      MuiStepLabel: {
        styleOverrides: {
          label: ({ theme }) => ({
            fontWeight: 500,
            fontFamily: 'Opentalk',
            fontSize: theme.typography.pxToRem(22),
            [theme.breakpoints.down('md')]: {
              fontSize: theme.typography.pxToRem(18),
            },
          }),
        },
      },
      MuiStepConnector: {
        styleOverrides: {
          line: ({ theme }) => ({
            borderTopWidth: 2,
            borderColor: theme.palette.primary.main,
          }),
        },
      },
      MuiStepButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            '& .MuiSvgIcon-root:not(.Mui-active)': {
              fontSize: theme.typography.pxToRem(20),
              padding: 10,
              borderRadius: '50%',
              [theme.breakpoints.down('md')]: {
                fontSize: theme.typography.pxToRem(16),
                padding: 8,
              },
            },
          }),
        },
      },
      MuiSelect: {
        styleOverrides: {
          iconOutlined: ({ theme }) => ({
            fill: theme.palette.primary.contrastText,
          }),
          icon: ({ theme }) => ({
            padding: theme.spacing(0.75),
            right: theme.spacing(1.25),
            [theme.breakpoints.down('md')]: {
              padding: theme.spacing(1),
            },
          }),
          select: ({ theme }) => ({
            '&&': {
              minHeight: 'unset',
              paddingRight: theme.spacing(6),
              [theme.breakpoints.down('md')]: {
                paddingRight: theme.spacing(5),
              },
            },
          }),
        },
      },
      MuiPickerPopper: {
        styleOverrides: {
          paper: ({ theme }) => ({
            backgroundColor: theme.palette.background.customPaper.primary,
            color: theme.palette.background.customPaper.contrastText,
          }),
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: ({ theme }) => ({
            fontWeight: 400,
            padding: theme.spacing(1.5, 2),
            color: theme.palette.text.primary,
            ':focus-visible': {
              outline: theme.palette.focus.outline,
              outlineOffset: '-2px',
            },
          }),
        },
      },
      MuiChip: {
        styleOverrides: {
          root: ({ theme }) => ({
            paddingRight: theme.spacing(1.5),
            fontSize: theme.typography.pxToRem(14),
            border: `1px solid ${theme.palette.primary.light}`,
            borderRadius: theme.borderRadius.large,
            height: 'unset',
            [theme.breakpoints.down('md')]: {
              fontSize: theme.typography.pxToRem(10),
            },
            '&.Mui-focusVisible': {
              outline: theme.palette.focus.outline,
              outlineOffset: theme.palette.focus.outlineOffset,
            },
          }),
          label: ({ theme }) => ({
            paddingRight: theme.spacing(2.5),
          }),
          deleteIcon: ({ theme }) => ({
            color: theme.palette.background.main.contrastText,
            marginRight: 0,
            ':hover': {
              color: theme.palette.secondary.light,
            },
            ':focus': {
              color: theme.palette.secondary.light,
            },
          }),
          avatar: ({ theme }) => ({
            width: 'calc(2.5rem - 2px)',
            height: 'calc(2.5rem - 2px)',
            marginLeft: 0,
            [theme.breakpoints.down('md')]: {
              width: 'calc(2rem - 2px)',
              height: 'calc(2rem - 2px)',
            },
          }),
          colorError: ({ theme }) => ({
            backgroundColor: theme.palette.error.main,
            color: theme.palette.error.contrastText,
          }),
        },
      },
      MuiTab: {
        styleOverrides: {
          root: ({ theme }) => ({
            textTransform: 'none',
            '&.Mui-selected': {
              backgroundColor: theme.palette.secondary.light,
            },
            '&.Mui-selected:hover': {
              backgroundColor: theme.palette.secondary.light,
            },
            '&:hover': {
              backgroundColor: theme.palette.background.main.primary,
            },
          }),
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: () => ({
            backgroundColor: 'transparent',
          }),
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: ({ theme }) => ({
            fontWeight: 400,
            color: theme.palette.text.primary,
          }),
          secondary: ({ theme }) => ({
            color: theme.palette.text.disabled,
          }),
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            '&.Mui-focusVisible ': {
              outline: theme.palette.focus.outline,
              backgroundColor: theme.palette.background.main.primary,
              '& .MuiTypography-root': {
                color: theme.palette.text.primary,
              },
            },
          }),
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.primary.main,
            marginRight: theme.spacing(0.5),
            '&.Mui-focusVisible': {
              outline: theme.palette.focus.outline,
            },
          }),
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            marginTop: 16,
            marginBottom: 16,
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: ({ theme }) => ({
            marginLeft: theme.typography.pxToRem(9),
            '&.MuiRadio-colorPrimary': {
              color: theme.palette.primary.main,
              '&.Mui-checked': {
                color: theme.palette.primary.main,
              },
            },
            '&.MuiRadio-colorSecondary': {
              color: theme.palette.secondary.main,
              '&.Mui-checked': {
                color: theme.palette.secondary.main,
              },
            },
            '&.MuiButtonBase-root.MuiRadio-root': {
              marginRight: theme.spacing(0.5),
              '&.Mui-focusVisible': {
                outline: theme.palette.focus.outline,
                outlineOffset: theme.palette.focus.outlineOffset,
              },
            },
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.customPaper.primary,
            backgroundImage: 'none',
            borderRadius: theme.borderRadius.medium,
            '& .MuiList-root': {
              margin: theme.spacing(1, 0),
              border: 0,
              padding: 0,
            },
          }),
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: ({ theme }) => ({
            padding: theme.spacing(0, 3, 2, 3),
            '&> :not(:first-of-type)': {
              marginLeft: theme.spacing(1),
            },
          }),
        },
      },
      MuiDateTimePickerTabs: {
        styleOverrides: {
          root: ({ theme }) => ({
            '& .MuiTab-root': {
              color: theme.palette.secondary.main,
              '&.Mui-selected': {
                color: theme.palette.secondary.main,
              },
            },
          }),
        },
      },
      MuiDayCalendar: {
        styleOverrides: {
          weekDayLabel: ({ theme }) => ({
            color: theme.palette.text.primary,
          }),
        },
      },
      MuiPickersLayout: {
        styleOverrides: {
          root: () => ({
            display: 'flex',
            flexDirection: 'column',
          }),
        },
      },
      MuiPickersCalendarHeader: {
        styleOverrides: {
          labelContainer: () => ({
            overflow: 'visible',
          }),
        },
      },
      MuiPickersDay: {
        styleOverrides: {
          root: ({ theme }) => ({
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            '&:focus': {
              outline: theme.palette.focus.outline,
            },
          }),
        },
      },
      MuiMultiSectionDigitalClockSection: {
        styleOverrides: {
          item: ({ theme }) => ({
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            '&:focus': {
              outline: theme.palette.focus.outline,
            },
          }),
        },
      },
      MuiClock: {
        styleOverrides: {
          wrapper: () => ({
            '& .MuiClockNumber-root': {
              color: theme.palette.text.primary,
            },
          }),
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          noOptions: () => ({
            color: theme.palette.text.primary,
          }),
        },
      },
      MuiUseMediaQuery: {
        defaultProps: {
          noSsr: true,
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.text.primary,
          }),
          colorSecondary: ({ theme }) => ({
            color: theme.palette.secondary.main,
          }),
        },
      },
    },
    typography: () => ({
      allVariants: {
        fontFamily: ['Opentalk', 'serif'].join(','),
        fontWeight: 500,
        lineHeight: 1.25,
      },
    }),
  });

  /**
   * setting responsive fonts
   */

  theme.typography = {
    ...theme.typography,
    h1: {
      lineHeight: 1.3,
      fontFamily: ['Opentalk', 'serif'].join(','),
      fontSize: theme.typography.pxToRem(22),
      [theme.breakpoints.down('md')]: {
        fontSize: theme.typography.pxToRem(18),
      },
    },
    h2: {
      fontFamily: ['Opentalk', 'serif'].join(','),
      fontSize: theme.typography.pxToRem(16),
      [theme.breakpoints.down('md')]: {
        fontSize: theme.typography.pxToRem(14),
      },
    },
    body1: {
      fontFamily: ['Opentalk', 'serif'].join(','),
      fontWeight: 500,
      fontSize: theme.typography.pxToRem(16),
      [theme.breakpoints.down('md')]: {
        fontSize: theme.typography.pxToRem(14),
      },
    },
    body2: {
      fontWeight: 400,
      fontFamily: ['Opentalk', 'serif'].join(','),
      fontSize: theme.typography.pxToRem(16),
      [theme.breakpoints.down('md')]: {
        fontSize: theme.typography.pxToRem(14),
      },
    },
    caption: {
      fontFamily: ['Opentalk', 'serif'].join(','),
      fontSize: theme.typography.pxToRem(12),
      fontWeight: 400,
      [theme.breakpoints.down('md')]: {
        fontSize: theme.typography.pxToRem(12),
      },
    },
  };
  return theme;
}
