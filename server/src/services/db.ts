import path from 'node:path';

// Return the db path for a given db json file name
export function getDbPath(fileName: string): string {
  return path.resolve("db", fileName);
}
