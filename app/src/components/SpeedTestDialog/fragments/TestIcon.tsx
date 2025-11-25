// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { keyframes, styled } from '@mui/material';

const fadeOutInOuter = keyframes`
  0%, 100% {
    opacity: 1
  }
  15%, 85% {
    opacity: 0
  }
`;

const fadeOutInMiddle = keyframes`
  15%, 85% {
    opacity: 1
  }
  30%, 70% {
    opacity: 0
  }
`;
const fadeOutInInner = keyframes`
  30%, 70% {
    opacity: 1
  }
  45%, 55% {
    opacity: 0
  }
`;

const StyledIcon = ({ ...props }) => {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path id="Base" d="M12.1,18.26a1,1,0,1,1-1,1,1,1,0,0,1,1-1h0" />
      <path data-testid="inner-path" id="inner" d="M8.24,16.67a5.44,5.44,0,0,1,7.73,0l1.09-1.09a7,7,0,0,0-9.91,0Z" />
      <path
        data-testid="middle-path"
        id="middle"
        d="M4.81,13.24a10,10,0,0,1,14.59,0l1.08-1.08a11.55,11.55,0,0,0-16.76,0Z"
      />
      <path
        data-testid="outer-path"
        id="outer"
        d="M1.19,9.65A15.66,15.66,0,0,1,23,9.63L24.1,8.54a17.22,17.22,0,0,0-24,0Z"
      />
    </svg>
  );
};

const TestIcon = styled(StyledIcon, {
  shouldForwardProp: (prop) => prop !== 'animated',
})<{ animated: boolean }>(({ animated }) => ({
  '& #outer': {
    animation: animated && `${fadeOutInOuter} 4s infinite linear`,
  },
  '& #middle': {
    animation: animated && `${fadeOutInMiddle} 4s infinite linear`,
  },
  '& #inner': {
    animation: animated && `${fadeOutInInner} 4s infinite linear`,
  },
}));

export default TestIcon;
