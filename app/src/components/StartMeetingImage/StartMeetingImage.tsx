// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { keyframes, styled } from '@mui/material';
import { SvgIcon, SvgIconProps } from '@mui/material';

import Illustration from '../../assets/images/start-meeting-illustration.svg?react';

const Svg = (props: SvgIconProps) => <SvgIcon {...props} component={Illustration} inheritViewBox aria-hidden />;

const fadeOutInLamp = keyframes`
  0%,
  24%,
  100% {
    opacity: 0;
  }

  25%,
  75% {
    opacity: 1;
  }
`;
const fadeOutInText = keyframes`
  0%,
  100% {
    opacity: 0;
    transform: translateX(-3%);
  }

  25%,
  75% {
    opacity: 1;
    transform: translateX(+0%);
  }

  99% {
    transform: translateX(+3%);
  }
`;

const pulse = keyframes`
  0%,
  100% {
    opacity: 0;
  }

  25%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR1 = keyframes`
  0%,
  100% {
    opacity: 0;
  }

  3.6%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR2 = keyframes`
  0%,
  3.6%,
  100% {
    opacity: 0;
  }

  7.2%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR3 = keyframes`
  0%,
  7.2%,
  100% {
    opacity: 0;
  }

  10.8%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR4 = keyframes`
  0%,
  10.8%,
  100% {
    opacity: 0;
  }

  14.4%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR5 = keyframes`
  0%,
  14.4%,
  100% {
    opacity: 0;
  }

  18%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR6 = keyframes`
  0%,
  18%,
  100% {
    opacity: 0;
  }

  21.6%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR7 = keyframes`
  0%,
  21.6%,
  100% {
    opacity: 0;
  }

  25%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR30 = keyframes`
  0%,
  100% {
    opacity: 0;
  }

  1.02%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR29 = keyframes`
  0%,
  1.02%,
  100% {
    opacity: 0;
  }

  2.04%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR28 = keyframes`
  0%,
  2.04%,
  100% {
    opacity: 0;
  }

  3.06%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR27 = keyframes`
  0%,
  3.06%,
  100% {
    opacity: 0;
  }

  4.08%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR26 = keyframes`
  0%,
  4.08%,
  100% {
    opacity: 0;
  }

  5.1%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR25 = keyframes`
  0%,
  5.1%,
  100% {
    opacity: 0;
  }

  6.12%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR24 = keyframes`
  0%,
  6.12%,
  100% {
    opacity: 0;
  }

  7.14%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR23 = keyframes`
  0%,
  7.14%,
  100% {
    opacity: 0;
  }

  8.16%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR22 = keyframes`
  0%,
  8.16%,
  100% {
    opacity: 0;
  }

  9.18%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR21 = keyframes`
  0%,
  9.18%,
  100% {
    opacity: 0;
  }

  10.2%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR20 = keyframes`
  0%,
  10.2%,
  100% {
    opacity: 0;
  }

  11.22%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR19 = keyframes`
  0%,
  11.22%,
  100% {
    opacity: 0;
  }

  12.24%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR18 = keyframes`
  0%,
  12.24%,
  100% {
    opacity: 0;
  }

  13.26%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR17 = keyframes`
  0%,
  13.26%,
  100% {
    opacity: 0;
  }

  14.28%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR16 = keyframes`
  0%,
  14.28%,
  100% {
    opacity: 0;
  }

  15.3%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR15 = keyframes`
  0%,
  15.3%,
  100% {
    opacity: 0;
  }

  16.32%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR14 = keyframes`
  0%,
  16.32%,
  100% {
    opacity: 0;
  }

  17.34%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR13 = keyframes`
  0%,
  17.34%,
  100% {
    opacity: 0;
  }

  18.36%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR12 = keyframes`
  0%,
  18.36%,
  100% {
    opacity: 0;
  }

  19.38%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR11 = keyframes`
  0%,
  19.38%,
  100% {
    opacity: 0;
  }

  20.4%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR10 = keyframes`
  0%,
  20.4%,
  100% {
    opacity: 0;
  }

  21.42%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR9 = keyframes`
  0%,
  21.42%,
  100% {
    opacity: 0;
  }

  22.5%,
  75% {
    opacity: 1;
  }
`;

const fadeOutInR8 = keyframes`
  0%,
  22.5%,
  100% {
    opacity: 0;
  }

  25%,
  75% {
    opacity: 1;
  }
`;

const StartMeetingImage = styled(Svg, {
  shouldForwardProp: (prop) => prop !== 'animated',
})<{ animated: boolean }>(({ animated }) => ({
  width: 'auto',
  height: 'auto',

  '#Lamp': {
    animation: animated && `${fadeOutInLamp} 3s infinite linear`,
  },
  '#Text': {
    animation: animated && `${fadeOutInText} 3s infinite linear`,
  },
  '#Pulse': {
    transformOrigin: 'center',
    animation: animated && `${pulse} 3s infinite linear`,
  },
  '#r1': {
    animation: animated && `${fadeOutInR1} 3s infinite linear`,
  },
  '#r2': {
    animation: animated && `${fadeOutInR2} 3s infinite linear`,
  },
  '#r3': {
    animation: animated && `${fadeOutInR3} 3s infinite linear`,
  },
  '#r4': {
    animation: animated && `${fadeOutInR4} 3s infinite linear`,
  },
  '#r5': {
    animation: animated && `${fadeOutInR5} 3s infinite linear`,
  },
  '#r6': {
    animation: animated && `${fadeOutInR6} 3s infinite linear`,
  },
  '#r7': {
    animation: animated && `${fadeOutInR7} 3s infinite linear`,
  },
  '#r8': {
    animation: animated && `${fadeOutInR8} 3s infinite linear`,
  },
  '#r9': {
    animation: animated && `${fadeOutInR9} 3s infinite linear`,
  },
  '#r10': {
    animation: animated && `${fadeOutInR10} 3s infinite linear`,
  },
  '#r11': {
    animation: animated && `${fadeOutInR11} 3s infinite linear`,
  },
  '#r12': {
    animation: animated && `${fadeOutInR12} 3s infinite linear`,
  },
  '#r13': {
    animation: animated && `${fadeOutInR13} 3s infinite linear`,
  },
  '#r14': {
    animation: animated && `${fadeOutInR14} 3s infinite linear`,
  },
  '#r15': {
    animation: animated && `${fadeOutInR15} 3s infinite linear`,
  },
  '#r16': {
    animation: animated && `${fadeOutInR16} 3s infinite linear`,
  },
  '#r17': {
    animation: animated && `${fadeOutInR17} 3s infinite linear`,
  },
  '#r18': {
    animation: animated && `${fadeOutInR18} 3s infinite linear`,
  },
  '#r19': {
    animation: animated && `${fadeOutInR19} 3s infinite linear`,
  },
  '#r20': {
    animation: animated && `${fadeOutInR20} 3s infinite linear`,
  },
  '#r21': {
    animation: animated && `${fadeOutInR21} 3s infinite linear`,
  },
  '#r22': {
    animation: animated && `${fadeOutInR22} 3s infinite linear`,
  },
  '#r23': {
    animation: animated && `${fadeOutInR23} 3s infinite linear`,
  },
  '#r24': {
    animation: animated && `${fadeOutInR24} 3s infinite linear`,
  },
  '#r25': {
    animation: animated && `${fadeOutInR25} 3s infinite linear`,
  },
  '#r26': {
    animation: animated && `${fadeOutInR26} 3s infinite linear`,
  },
  '#r27': {
    animation: animated && `${fadeOutInR27} 3s infinite linear`,
  },
  '#r28': {
    animation: animated && `${fadeOutInR28} 3s infinite linear`,
  },
  '#r29': {
    animation: animated && `${fadeOutInR29} 3s infinite linear`,
  },
  '#r30': {
    animation: animated && `${fadeOutInR30} 3s infinite linear`,
  },
}));

export default StartMeetingImage;
