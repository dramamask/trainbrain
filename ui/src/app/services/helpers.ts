/**
 * Right trim a specific character from the end of a string
 *
 * @param {string} str - the string to trim
 * @param {string} char - The character to remove from the end
 * @returns {string} The trimmed string
 */
export const rtrim = (str: string, char: string): string =>
  str.endsWith(char) ? str.slice(0, -1) : str;

