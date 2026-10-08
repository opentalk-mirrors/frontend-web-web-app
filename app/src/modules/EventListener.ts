// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import mitt, { Handler, EventType } from 'mitt';

interface EventListener<E> {
  addEventListener<Key extends keyof E>(type: Key, handler: Handler<E[Key]>): void;
  removeEventListener<Key extends keyof E>(type: Key, handler: Handler<E[Key]>): void;
}

export abstract class BaseEventEmitter<E extends Record<EventType, unknown>> implements EventListener<E> {
  protected eventEmitter = mitt<E>();

  addEventListener<Key extends keyof E>(type: Key, handler: Handler<E[Key]>): void {
    this.eventEmitter.on(type, handler);
  }

  removeEventListener<Key extends keyof E>(type: Key, handler: Handler<E[Key]>): void {
    this.eventEmitter.off(type, handler);
  }
}
