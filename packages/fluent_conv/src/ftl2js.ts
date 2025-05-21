import { parse } from '@fluent/syntax';

import type { FluentIJs, InnerFluentJs } from '.';
import { serialize } from './ftl2jsSerializer';

type Params = { respectComments: true };
/**
 * Parse fluent string synchronously into JS object
 *
 * @param {string} str Fluent file as string
 * @param {Object} params Parameters
 * @throws {Error} Error when the first argument was not a string or input is malformed
 * @returns {Object} Fluent JS intermediate object
 */
export function ftlToJsParse(str: string, params: Params = { respectComments: true }): FluentIJs {
  if (typeof str !== 'string') {
    throw new Error('The first parameter was not a string');
  }

  const parsed = parse(str, { withSpans: false });

  const result = parsed.body.reduce<FluentIJs>((acc, segment) => {
    const serializedSegment = serialize(segment);
    if (!serializedSegment) {
      return acc;
    }
    if (
      (serializedSegment.attributes && serializedSegment.attributes.length) ||
      (serializedSegment.comment && params.respectComments)
    ) {
      const inner: InnerFluentJs = { value: serializedSegment.value };
      if (serializedSegment.comment) {
        inner[serializedSegment.comment.key] = serializedSegment.comment.value;
      }
      if (serializedSegment.attributes && serializedSegment.attributes.length) {
        serializedSegment.attributes.forEach((attr) => {
          inner[attr.key] = attr.value;
        });
      }

      acc[serializedSegment.key] = inner;
    } else {
      acc[serializedSegment.key] = serializedSegment.value;
    }
    return acc;
  }, {});

  return result;
}

/**
 * Parse fluent string into JS object using a callback to deliver the result.
 *
 * @param {string} str Fluent file as string
 * @param {(Error, [])} cb Callback which is called with the result or the error
 * @param {Object} params Parameters
 */
export function ftlToJsCallback(
  str: string,
  cb: (err: Error | null, res: FluentIJs | null) => void,
  params: Params = { respectComments: true }
): void {
  try {
    cb(null, ftlToJsParse(str, params));
  } catch (err) {
    cb(err as Error, null);
  }
}

/**
 * Parse fluent string into JS object.
 * The result it either returned directly or via callback.
 *
 * @param {string} str Fluent file as string
 * @param {(Error, [])} cb Callback which is called with the result or the error
 * @param {Object} params Parameters
 * @throws {Error} Error when the first argument was not a string or input is malformed
 * @returns {Object} Fluent JS intermediate object in no callback is provided
 */
export default function ftlToJs(
  str: string,
  cb?: (err: Error | null, res: FluentIJs | null) => void,
  params: Params = { respectComments: true }
): FluentIJs | void {
  if (cb) {
    return ftlToJsCallback(str, cb, params);
  }
  return ftlToJsParse(str, params);
}
