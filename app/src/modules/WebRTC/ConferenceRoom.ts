// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { generatePkceChallenge } from '@opentalk/redux-oidc';
import { isEmpty } from 'lodash';

import type { ApiErrorWithBody } from '../../api/rest';
import { StartRoomError } from '../../api/rest';
import type { Message as IncomingMessage } from '../../api/types/incoming';
import type { Message as RoomserverCoreMessage } from '../../api/types/incoming/core';
import type { Message as OutgoingMessage } from '../../api/types/outgoing';
import log from '../../logger';
import type { RoomCredentials } from '../../store/commonActions';
import type { ConfigState } from '../../store/slices/configSlice';
import { fetchWithAuth, getControllerBaseUrl, getSignalingUrl } from '../../utils/apiUtils';
import { BaseEventEmitter } from '../EventListener';
import { SignalingSocket, SignalingState } from './SignalingSocket';

/**
 * ### State Machine Graph
 * - Initial -> Setup
 * - Setup -> Starting
 * - Starting -> Blocked
 * - Starting -> Waiting ->ReadyToEnter -> Online
 * - Starting -> Failed
 * - Starting -> Failed-credentials
 * - Starting -> Online
 * - Online -> Failed
 * - Online -> Leaving
 * - Leaving -> Failed
 * - Leaving -> Left
 * - Failed -> Starting
 * - Failed -> Left
 * - Left -> Starting
 */

export enum ConnectionState {
  Initial = 'initial',
  Setup = 'setup',
  Starting = 'starting',
  Waiting = 'waiting',
  Online = 'online',
  Leaving = 'leaving',
  Left = 'left',
  Failed = 'failed',
  FailedCredentials = 'failed-credentials',
  Blocked = 'blocked',
  ReadyToEnter = 'ready-to-enter',
}

const REJOIN_ON_BLOCKED_CONNECTION_TIME = 10000;
const FORCE_NEW_DEVICE_SECRET_KEY = 'force_new_device_secret';
const DEVICE_SECRET_KEY = 'device_secret';

type ConferenceEvent = {
  connected: undefined;
  // A 'shutdown' event is sent after the whole WebRTC context has been terminated and all connections are closed.
  shutdown: { error?: number };
  message: IncomingMessage;
};

let currentConferenceRoom: ConferenceRoom | undefined = undefined;

export const setCurrentConferenceRoom = (room: ConferenceRoom) => {
  currentConferenceRoom = room;
  const shutdownHandler = () => {
    currentConferenceRoom?.removeEventListener('shutdown', shutdownHandler);
    currentConferenceRoom = undefined;
  };
  currentConferenceRoom.addEventListener('shutdown', shutdownHandler);
};

export const getCurrentConferenceRoom = () => {
  return currentConferenceRoom;
};

export const setForceNewDeviceSecret = (enabled: boolean) => {
  if (enabled) {
    localStorage.setItem(FORCE_NEW_DEVICE_SECRET_KEY, '1');
  } else {
    localStorage.removeItem(FORCE_NEW_DEVICE_SECRET_KEY);
  }
};

const createOrGenerateDeviceSecret = async () => {
  if (!localStorage.getItem(FORCE_NEW_DEVICE_SECRET_KEY)) {
    const storedDeviceSecret = localStorage.getItem(DEVICE_SECRET_KEY);
    if (storedDeviceSecret && storedDeviceSecret.length >= 16 && storedDeviceSecret.length < 255) {
      return storedDeviceSecret;
    }
  }

  const newSecret = await generatePkceChallenge();
  localStorage.setItem(DEVICE_SECRET_KEY, newSecret);

  return newSecret;
};

export const startRoom = async (credentials: RoomCredentials, config: ConfigState, displayName: string) => {
  const roomPath = `v1/rooms/${credentials.roomId}`;

  let authUrl: URL;
  if (credentials.inviteCode !== undefined) {
    authUrl = new URL(`${roomPath}/start_invited`, getControllerBaseUrl(config));
  } else {
    authUrl = new URL(`${roomPath}/start`, getControllerBaseUrl(config));
  }

  const { inviteCode, password } = credentials;
  const body = JSON.stringify({
    device_secret: await createOrGenerateDeviceSecret(),
    display_name: displayName,
    invite_code: inviteCode,
    password: password || undefined,
  });

  const response = await fetchWithAuth(
    authUrl,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    },
    inviteCode
  );

  if (!response.ok) {
    if (response.status === 403) {
      const error = { status: response.status, code: StartRoomError.Forbidden };
      throw error;
    }
    if (response.status === 404) {
      const error = { status: response.status, code: StartRoomError.NotFound };
      throw error;
    }
    const { code, message }: ApiErrorWithBody<StartRoomError> = await response.json();
    const error = { status: response.status, code, message };
    throw error;
  }
  const { token, roomserver_address }: { token: string; roomserver_address: string } = await response.json();

  return { token, roomserver_address };
};

/**
 * Transforms the participants Publishing object from Record<MediaSessionType, MediaSessionState> to and array SubscriberState descriptions.
 * @param {Participant} participant to get the media session state from
 * @returns {Array<SubscriberConfig>} for this participant as stored in redux
 */

export class ConferenceRoom extends BaseEventEmitter<ConferenceEvent> {
  private readonly signaling: SignalingSocket;
  public readonly roomCredentials: RoomCredentials;
  private participantName?: string;
  private rejoinTimer?: ReturnType<typeof window.setTimeout>;

  public static async create(
    roomCredentials: RoomCredentials,
    config: ConfigState,
    displayName: string
  ): Promise<{ conferenceContext: ConferenceRoom; token: string }> {
    log.debug('connect to room', roomCredentials);
    const { token, roomserver_address } = await startRoom(roomCredentials, config, displayName);
    const signaling = new SignalingSocket(getSignalingUrl(roomserver_address, token));
    const conferenceContext = new ConferenceRoom(roomCredentials, signaling);
    setCurrentConferenceRoom(conferenceContext);
    return { conferenceContext, token };
  }

  private constructor(roomCredentials: RoomCredentials, signaling: SignalingSocket) {
    super();

    this.roomCredentials = roomCredentials;
    this.signaling = signaling;
    this.signaling.addEventListener('connectionstatechange', this.signalingStateHandler);
    this.signaling.addEventListener('message', this.signalingMessageHandler);
  }

  public join(displayName: string) {
    if (!this.signaling.isOpen()) {
      throw new Error('can not join room when not connected');
    }
    if (isEmpty(displayName)) {
      throw new Error('displayName must be not empty');
    }

    this.participantName = displayName;
  }

  private handleCoreMessage(message: RoomserverCoreMessage) {
    switch (message.message) {
      case 'join_blocked':
        // try to automatically rejoin a blocked room
        this.rejoinTimer = setTimeout(() => {
          this.join(this.participantName ?? '');
        }, REJOIN_ON_BLOCKED_CONNECTION_TIME);
        break;
    }
  }

  private signalingMessageHandler = (message: IncomingMessage) => {
    // TODO consume media messages
    // inspect join_success for participantId

    const { namespace, payload } = message;
    switch (namespace) {
      case 'media': {
        const subType = payload.message;
        // TODO: Theses are actually a control messages -- talk to the backend
        if (
          subType === 'error' ||
          subType === 'request_mute' ||
          subType === 'speaker_updated' ||
          subType === 'presenter_role_granted' ||
          subType === 'presenter_role_revoked'
        ) {
          break;
        }
        // do not propagate WebRTC messages
        return;
      }
      case 'core':
        this.handleCoreMessage(payload);
        break;
      default:
        //let the react app take care
        break;
    }
    this.eventEmitter.emit('message', message);
  };

  private signalingStateHandler = async (state: SignalingState) => {
    switch (state) {
      case 'connected':
        log.debug('signaling connected');
        this.eventEmitter.emit('connected');
        break;
      case 'disconnected':
        {
          log.error('signaling disconnected abnormally');

          // TODO reconnect
          this.eventEmitter.emit('shutdown', { error: 9999 });
        }
        return;
      case 'closed':
        {
          this.eventEmitter.emit('shutdown', {});
        }
        return;
    }
  };

  public sendMessage(message: OutgoingMessage) {
    this.signaling.sendMessage(message);
  }

  public shutdown() {
    log.info('shutdown conference context');
    this.signaling.removeEventListener('message', this.signalingMessageHandler);
    this.signaling.removeEventListener('connectionstatechange', this.signalingStateHandler);

    this.signaling.disconnect();
    this.eventEmitter.emit('shutdown', {});
    this.eventEmitter.all.clear();
    this.rejoinTimer && clearTimeout(this.rejoinTimer);
  }
}
