// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { InviteCode } from '@opentalk/rest-api-rtk-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import SuspenseLoading from '../../commonComponents/SuspenseLoading/SuspenseLoading';
import Error from '../../components/Error';
import { useAppDispatch } from '../../hooks';
import { fetchRoomByInviteId, InviteRoomVerifyResponse } from '../../store/slices/roomSlice';
import { FetchRequestError } from '../../types';
import { composeRoomPath } from '../../utils/apiUtils';

/**
 * @deprecated To be removed when there are no `/invite/<invite_code>` links in use. Related to https://git.opentalk.dev/opentalk/backend/services/controller/-/issues/474
 */
const InvitePage = () => {
  const dispatch = useAppDispatch();
  const [error, setError] = useState<FetchRequestError | undefined>();
  const { t } = useTranslation();
  const { inviteCode } = useParams<'inviteCode'>() as { inviteCode: InviteCode };
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchRoomByInviteId(inviteCode))
      .unwrap()
      .then(({ roomId }: InviteRoomVerifyResponse) => {
        navigate(composeRoomPath(roomId));
      })
      .catch((error: FetchRequestError) => setError(error));
  }, [dispatch, navigate, inviteCode]);

  if (error) {
    return <Error title={t('error-invite-link')} />;
  }

  return <SuspenseLoading />;
};

export default InvitePage;
