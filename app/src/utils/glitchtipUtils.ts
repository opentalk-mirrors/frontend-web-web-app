// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import * as Sentry from '@sentry/browser';
import i18next from 'i18next';

export const DELAY_BETWEEN_EVENT_AND_REPORT_MS = 2500;

const glitchtipDialogProps = () => {
  return {
    title: i18next.t('glitchtip-crash-report-title'),
    subtitle: i18next.t('glitchtip-crash-report-subtitle'),
    subtitle2: i18next.t('glitchtip-crash-report-subtitle2'),
    labelName: i18next.t('glitchtip-crash-report-labelName'),
    labelEmail: i18next.t('glitchtip-crash-report-labelEmail'),
    labelComments: i18next.t('glitchtip-crash-report-labelComments'),
    labelClose: i18next.t('glitchtip-crash-report-labelClose'),
    labelSubmit: i18next.t('glitchtip-crash-report-labelSubmit'),
    errorGeneric: i18next.t('glitchtip-crash-report-errorGeneric'),
    errorFormEntry: i18next.t('glitchtip-crash-report-errorFormEntry'),
    successMessage: i18next.t('glitchtip-crash-report-successMessage'),
  };
};

type SentryUser = {
  email?: string;
  name: string;
  lang: string;
};

export const initSentryReportWithUser = (user: SentryUser) => {
  window.showReportDialog = (event) => {
    const props = glitchtipDialogProps();
    Sentry.showReportDialog({
      eventId: event.event_id,
      title: props.title,
      subtitle: props.subtitle,
      subtitle2: props.subtitle2,
      labelName: props.labelName,
      labelEmail: props.labelEmail,
      labelComments: props.labelComments,
      labelClose: props.labelClose,
      labelSubmit: props.labelSubmit,
      errorGeneric: props.errorGeneric,
      errorFormEntry: props.errorFormEntry,
      successMessage: props.successMessage,
      lang: user.lang,
      user: {
        email: user.email,
        name: user.name,
      },
    });
    return event;
  };
};
export const triggerGlitchtipManually = () => {
  throw new Error('Manual Glitchtip trigger');
};
