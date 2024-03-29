import type { KVClient } from '../ambient';

/**
 * patch for KVCli
 * because KVCli is in server side

 * Code like this:
 * if(!browser)import('server/xxx')
 * will throw error
 */
export const kv = {} as KVClient