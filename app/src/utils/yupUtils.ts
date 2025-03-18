// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import * as yup from 'yup';

yup.addMethod<yup.StringSchema>(yup.string, 'maxBytes', function (maxBytes: number, message?: string) {
  return this.test('maxBytes', message || '', function (value) {
    const { path, createError } = this;

    const valueByteLenght = new TextEncoder().encode(value).length;
    const remainingCharacters = maxBytes - valueByteLenght;

    if (remainingCharacters < 0) {
      return createError({ path, message });
    }

    return true;
  });
});

yup.addMethod<yup.StringSchema>(yup.string, 'validateURL', function (message?: string) {
  return this.test('validateURL', message || '', function (value) {
    const { path, createError } = this;
    if (!value) {
      return createError({ path, message });
    }

    try {
      const url = new URL(value);
      return url.protocol.length > 0;
    } catch (_error) {
      return createError({ path, message });
    }
  });
});

declare module 'yup' {
  interface StringSchema<
    TType extends yup.Maybe<string> = string | undefined,
    TContext extends yup.AnyObject = yup.AnyObject,
    TDefault = undefined,
    TFlags extends yup.Flags = '',
  > extends yup.Schema<TType, TContext, TDefault, TFlags> {
    /**
     * MUST IMPORT yup FROM yupUtils.ts TO ACCESS
     */
    maxBytes(maxBytes: number, message?: string): yup.StringSchema<undefined, TContext>;
    /**
     * MUST IMPORT yup FROM yupUtils.ts TO ACCESS
     *
     * Custom method for validating URLs.
     * @param message
     * Error message displayed when URL is not valid.
     */
    validateURL(message?: string): StringSchema<TType, TContext>;
  }
}

export default yup;
