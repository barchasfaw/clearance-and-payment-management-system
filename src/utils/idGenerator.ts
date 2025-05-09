/**
 * Generates a unique ID with a specified prefix
 * @param prefix The prefix to use for the ID
 * @returns A unique ID string
 */
export const generateId = (prefix: string = 'USR'): string => {
    const timestamp = new Date().getTime().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${timestamp}${randomStr}`.substring(0, 12);
  };