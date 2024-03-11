import type { BucketClient, DBClient, KVClient } from '../../ambient';
import cloudflareConnector from './adapter/cloudflare';

export const bukCli = {} as BucketClient;
export const dbCli = {} as DBClient;
export const kvCli = {} as KVClient;
export const connect = cloudflareConnector(kvCli, bukCli, dbCli);
