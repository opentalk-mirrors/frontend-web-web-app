// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// Will be addressed in https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2129
import { styled } from '@mui/material';

import log from '../../../logger';
import { MediaDescriptor } from '../../../modules/WebRTC';

const ContentContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto auto',
  padding: theme.spacing(1),
}));

// export const EndpointInfo = ({ endpoint }: { endpoint?: NetworkEndpoint }) => {
//   const { t } = useTranslation();

//   if (endpoint === undefined) {
//     return <span>'-'</span>;
//   }
//   const address = endpoint.address || t('statistics-value-redacted');
//   return (
//     <>
//       {`${address}:${endpoint.port} (${endpoint.protocol})`}
//       {endpoint.networkType && ` ${endpoint.networkType}`}
//     </>
//   );
// };

export const StatisticsContent = ({ descriptor }: { descriptor: MediaDescriptor }) => {
  log.error('TODO: livekit - StatisticsContent: ', descriptor);

  // const stats = useAppSelector(selectStatsById(descriptor));
  // if (stats === undefined) {
  //   return <SuspenseLoading />;
  // }

  // const { mediaStream, connection } = stats;
  // const { bitRate, frameRate, packetLoss, frameHeight, frameWidth, jitter, codingTime } = mediaStream;

  // The latency and jitter value may default to 0, which is invalid.
  // We use 0.5ms as threshold for validity.
  // We expect both to be a couple of milliseconds under good conditions.
  // const validJitter =
  //   jitter !== undefined && jitter > 0.5 * MILLISECONDS_PER_SECOND && Math.round(jitter * MILLISECONDS_PER_SECOND);

  // const validLatency =
  //   connection.avgRTT !== undefined &&
  //   connection.avgRTT > 0.5 * MILLISECONDS_PER_SECOND &&
  //   Math.round((connection.avgRTT / 2) * MILLISECONDS_PER_SECOND);

  // const validPacketLoss = packetLoss !== undefined && Math.round(packetLoss * 100);

  return (
    <ContentContainer>
      {/* {frameHeight && frameWidth && (
        <>
          <Typography variant="body2">{`${t('statistics-video')}: `}</Typography>
          <Typography variant="body2" align="right">
            {`${frameWidth}x${frameHeight}`}
          </Typography>
        </>
      )}
      <Typography variant="body2">{`${t('statistics-rate')}: `}</Typography>
      <Typography variant="body2" align="right">
        {formatBitRate(bitRate)}
      </Typography>
      <Typography variant="body2">{`${t('statistics-fps')}: `}</Typography>
      <Typography variant="body2" align="right">
        {frameRate ? `${Math.round(frameRate)} FPS` : '-'}
      </Typography>
      <Typography variant="body2">{`${t('statistics-jitter')}: `}</Typography>
      <Typography variant="body2" align="right">
        {validJitter ? `${validJitter} ms` : '-'}
      </Typography>
      <Typography variant="body2">{`${t('statistics-latency')}: `}</Typography>
      <Typography variant="body2" align="right">
        {validLatency ? `${validLatency} ms` : '-'}
      </Typography>
      <Typography variant="body2">{`${t('statistics-packets-lost')}: `}</Typography>
      <Typography variant="body2" align="right">
        {validPacketLoss ? `${validPacketLoss} % ` : '-'}
      </Typography>
      {codingTime !== undefined && (
        <>
          <Typography variant="body2">{`${t('statistics-decode-time')}: `}</Typography>
          <Typography variant="body2" align="right">
            {Math.round(codingTime * 1000)} ms
          </Typography>
        </>
      )}
      <Typography variant="body2">{`${t('statistics-local-network-endpoint')}: `}</Typography>
      <Typography variant="body2" align="left">
        <EndpointInfo endpoint={connection.localEndpoint} />
      </Typography>
      <Typography variant="body2">{`${t('statistics-remote-network-endpoint')}: `}</Typography>
      <Typography variant="body2" align="left">
        <EndpointInfo endpoint={connection.remoteEndpoint} />
      </Typography> */}
    </ContentContainer>
  );
};
