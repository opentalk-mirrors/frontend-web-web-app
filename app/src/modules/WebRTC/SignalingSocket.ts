// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import convertToCamelCase from 'camelcase-keys';
import convertToSnakeCase from 'snakecase-keys';

import type { Message as IncomingMessage } from '../../api/types/incoming';
import type { Message as OutgoingMessage } from '../../api/types/outgoing';
import { NamespacedIncoming } from '../../types';
import { BaseEventEmitter } from '../EventListener';

const uuidMatchingRegexp = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

// Currently, this is a living spec
const API_VERSION = '1.0';

/*
 * Signaling state chart:
 *              connect()     connection lost / reconnect()
 *             /             /
 * connecting -> connected <-> disconnected -+-> closed
 *            \____________\________________/
 *               close() is possible from all states
 */
export type SignalingState = 'connected' | 'disconnected' | 'closed';

type SignalingConnectionEvent = {
  connectionstatechange: SignalingState;
  message: IncomingMessage;
};

type EchoMessage = NamespacedIncoming<{ message: 'ping' }, 'echo'>;

const HEARTBEAT_INTERVAL = 12000; //ms
const HEARTBEAT_TIMEOUT = 10000; //ms
export class SignalingSocket extends BaseEventEmitter<SignalingConnectionEvent> {
  private readonly url: URL;
  private readonly socket;

  private _debugReconnect = false;

  private heartbeatIntervalId?: NodeJS.Timeout;
  private closeSignalingTimeoutId?: NodeJS.Timeout;

  constructor(url: URL, ticket: string) {
    super();
    this.url = url;
    const windowRef = window;
    windowRef.debugKillSignaling = () => {
      this._debugReconnect = true;
      this.socket.close();
    };

    this.socket = new WebSocket(this.url, [`ticket#${ticket}`, `opentalk-signaling-json-v${API_VERSION}`]);
    this.socket.onopen = this.onConnected;
    this.socket.onmessage = (ev) => {
      const message: IncomingMessage | EchoMessage = convertToCamelCase(JSON.parse(ev.data), {
        // We exclude votingRecord, lastSeenTimestamp* because they contain id that must not be converted to the camel case
        // as we can no longer map them to the participants.
        stopPaths: [
          'payload.voting_record',
          'payload.chat.last_seen_timestamps_private',
          'payload.chat.last_seen_timestamps_group',
        ],
        deep: true,
        //Preserves formatting for keys that match uuid pattern (example: "765bb8e6-77cf-40ee-94f3-b1aefe9a1d0c")
        exclude: [uuidMatchingRegexp],
      });
      // Server responded on our message heartbeat -> connection is still alive
      if (message.namespace === 'echo') {
        this.resetCloseSignalingTimeout();
        return;
      }
      this.eventEmitter.emit('message', message);
    };
    this.socket.onclose = this.onClose;
  }

  public isOpen() {
    return this.socket.readyState === WebSocket.OPEN;
  }

  private onConnected = () => {
    this.eventEmitter.emit('connectionstatechange', 'connected');
    this.heartbeatIntervalId = setInterval(() => this.initiateSignalingHeartbeat(), HEARTBEAT_INTERVAL);
  };

  private resetCloseSignalingTimeout() {
    if (this.closeSignalingTimeoutId) {
      clearTimeout(this.closeSignalingTimeoutId);
    }
  }

  private initiateSignalingHeartbeat() {
    if (this.isOpen()) {
      this.socket.send(JSON.stringify({ namespace: 'echo', payload: { action: 'ping' } }));
    }

    this.closeSignalingTimeoutId = setTimeout(() => {
      this.socket.close();
      // We need to emit the connectionstatechange here, because in contrary
      // websocket will wait for 30sec before dispatching onClose event
      this.eventEmitter.emit('connectionstatechange', 'disconnected');
    }, HEARTBEAT_TIMEOUT);
  }

  public sendMessage(message: OutgoingMessage) {
    let convertedMessage: OutgoingMessage;
    if (message.namespace === 'media' && message.payload.action === 'sdp_candidate') {
      convertedMessage = convertToSnakeCase(message, {
        exclude: ['sdpMLineIndex', 'sdpMid'],
      });
    } else {
      convertedMessage = convertToSnakeCase(message);
    }

    if (this.isOpen()) {
      this.socket.send(JSON.stringify(convertedMessage));
    } else {
      throw new Error('Websocket is not connected or not ready');
    }
  }

  public disconnect = () => {
    if (!this.isOpen()) {
      console.warn('disconnect signaling when not connected');
    }
    this.socket.close(1000, 'Normal Shutdown');
  };

  // For closure status codes see: https://www.rfc-editor.org/rfc/rfc6455.html#section-7.4.1
  private onClose = (e: CloseEvent) => {
    console.debug(`signaling socket closed with ${e.code}: ${e.reason}`);
    clearInterval(this.heartbeatIntervalId);
    clearTimeout(this.closeSignalingTimeoutId);
    this.socket.onmessage = null;
    this.socket.onclose = null;

    // TODO remove
    if (this._debugReconnect) {
      console.info(`Debug action: mimic signaling websocket connection error`);
      this.eventEmitter.emit('connectionstatechange', 'disconnected');
      return;
    }

    switch (e.code) {
      case 1000:
        // normal disconnect
        this.eventEmitter.emit('connectionstatechange', 'closed');
        break;

      case 1001: // Either the server or client will become unavailable.
      case 1005: // No status / debug disconnect
      case 1006: // Abnormal closure
      case 1007: // Unsupported payload
      case 1012: // Server restart
      case 1013: // Try again later
        console.warn(`Connection Lost: Signaling websocket closed with reason ${e.code}: ${e.reason}`);
        this.eventEmitter.emit('connectionstatechange', 'disconnected');
        break;
      case 4999: // custom error code when heartbeat is failing (can't reach a signaling response)
        console.warn(`Connection Lost: Signaling websocket closed with reason ${e.code}: ${e.reason}`);
        this.eventEmitter.emit('connectionstatechange', 'disconnected');
        break;
      default:
        console.error(`Connection Lost: Signaling websocket closed with reason ${e.code}: ${e.reason}`);
        this.eventEmitter.emit('connectionstatechange', 'closed');
        break;
    }
  };
}
