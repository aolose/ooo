import type { BucketClient, DBClient } from '../../ambient';
import cloudflareConnector from './adapter/cloudflare';

export const bukCli = {} as BucketClient;
export const dbCli = {} as DBClient;
export const connect = cloudflareConnector(bukCli, dbCli);