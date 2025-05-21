import type { FluentIJs } from '.';

/**
 * Creates a k=value pair from two string arguments.
 *
 * As this probably handles remote origin inputs, we carefully check if the
 * types are correct additionally to typescripts warnings as these are not checked at runtime.
 * @param string key
 * @param string value
 * @returns k=value
 * @throws
 */
function addValue(k: string, value: string): string {
  if (typeof k !== 'string' || typeof value !== 'string') {
    throw new Error('called addValue with a non-string key or value');
  }

  if (value && value.indexOf('\n') > -1) {
    const padding = '\n  ';
    const paddedLines = value.split('\n').join(padding);
    return `${k} =${padding}${paddedLines}`;
  } else {
    return `${k} = ${value}`;
  }
}

/**
 * Returns a fluent comment based on the input argument
 *
 * As this probably handles remote origin inputs, we carefully check if the
 * types are correct additionally to typescripts warnings as these are not checked at runtime.
 * @param comment
 * @returns
 * @throws
 */
function addComment(comment: string): string {
  if (typeof comment !== 'string') {
    throw new Error('called addComment with non-string value');
  }
  return `# ${comment.split('\n').join('\n# ')}\n`;
}

/**
 * Transforms the fluent js intermediate format into a Fluent string
 *
 * Throws if the resources contained non-valid fluent values (e.g. non-string values)
 * @param {Object} resources Object in FluentIJs structure
 * @param {(Error, string) => void} [cb]  A callback which is called with the result.
 * @returns {string} Fluent translation list
 * @throws
 */
export default function js2ftl(resources: FluentIJs, cb?: (err: Error | null, result: string | null) => void): string {
  const ftl = Object.entries(resources)
    .map(([k, value]) => {
      const parts: Array<string> = [];

      if (typeof value === 'string') {
        return `${addValue(k, value)}\n\n`;
      }

      if (value.comment) {
        parts.push(addComment(value.comment));
      }

      if (typeof value.value !== 'string') {
        throw new Error(`Value ${k} with attributes had no value. Found: ${value.value}`);
      }
      parts.push(addValue(k, value.value));

      Object.entries(value).forEach(([innerK, innerValue]) => {
        if (innerK === 'comment' || innerK === 'value') {
          return;
        }
        if (typeof innerValue !== 'string') {
          throw new Error(`Inner value ${innerK} with attributes had no value. Found: ${innerValue}`);
        }
        parts.push(addValue('\n  .' + innerK, innerValue));
      });
      parts.push('\n\n');
      return parts.join('');
    })
    .join('');

  if (cb) {
    cb(null, ftl);
  }
  return ftl;
}
