// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled } from '@mui/material';

import { useGetMeQuery } from '../../api/rest';
import { ParticipantAvatar, setLibravatarOptions } from '../../commonComponents';
import { useAppSelector } from '../../hooks';
import { useDisplayName } from '../../hooks/useDisplayName';
import { selectLibravatarDefaultImage } from '../../store/slices/configSlice';

const BigParticipantAvatar = styled(ParticipantAvatar)({
  width: 144,
  height: 144,
});

type ProfilePictureSize = 'small' | 'big';

interface ProfilePictureProps {
  size?: ProfilePictureSize;
}

const ProfilePicture = (props: ProfilePictureProps) => {
  const { size } = props;
  const { data } = useGetMeQuery();
  const avatarDefaultImage = useAppSelector(selectLibravatarDefaultImage);

  const displayName = useDisplayName(data);
  const avatarSrc = setLibravatarOptions(data?.avatarUrl, { defaultImage: avatarDefaultImage });

  if (size === 'big') {
    return (
      <BigParticipantAvatar src={avatarSrc} translate="no">
        {displayName}
      </BigParticipantAvatar>
    );
  } else {
    return (
      <ParticipantAvatar src={avatarSrc} translate="no">
        {displayName}
      </ParticipantAvatar>
    );
  }
};

export default ProfilePicture;
