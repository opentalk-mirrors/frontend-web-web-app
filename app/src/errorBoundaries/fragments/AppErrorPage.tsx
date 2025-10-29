// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ErrorInfo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Error from '../../components/Error';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { getCurrentConferenceRoom } from '../../modules/WebRTC/ConferenceRoom';
import { hangUp } from '../../store/commonActions';
import { selectErrorReportEmail } from '../../store/slices/configSlice';

interface AppErrorProps {
  error: Error;
  errorInfo?: ErrorInfo;
}

const AppErrorPage = ({ errorInfo, error }: AppErrorProps) => {
  const { t } = useTranslation();
  const email = useAppSelector(selectErrorReportEmail);
  const dispatch = useAppDispatch();
  const currentConferenceRoom = getCurrentConferenceRoom();

  useEffect(() => {
    if (currentConferenceRoom) {
      dispatch(hangUp());
    }
  }, [dispatch, currentConferenceRoom]);

  return (
    <Error
      title={t('show-diagnostic-data-title')}
      description={t('show-diagnostic-data-message', { errorReportEmail: email })}
      isCrashError
      logout
      error={error}
      errorInfo={errorInfo}
    />
  );
};

export default AppErrorPage;
