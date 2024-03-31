import { type Connect, type Plugin, transformWithEsbuild } from 'vite';
import { readFileSync } from 'node:fs';
import { Server } from 'node:http';
import type { Duplex } from 'node:stream';

type IncomingMessage = Connect.IncomingMessage;

export type serverHandle = (
	request: IncomingMessage | Request,
	socket: Duplex,
	head: Buffer
) => Response | Promise<Response | void> | void;

const devGlobal = global as typeof global & {
	__serverHandle: serverHandle;
};

export default function (handle: string) {
	return {
		name: 'svelte-kit-websocket',
		async transform(code, id) {
			if (id.endsWith('@sveltejs/kit/src/runtime/server/index.js')) {
				const r = await this.resolve(handle);
				if (!r) return null;
				this.addWatchFile(r.id);
				const c = readFileSync(r.id).toString();
				const h = await transformWithEsbuild(c, r.id);
				code =
					'import {dev} from "$app/environment";' +
					h.code +
					code.replace(
						'async respond(request, options) {',
						`
                async respond(request, options) {
                    if(handle){
                      if(dev)global.__serverHandle=handle
                      else{
                         const resp = await handle(request)
                         if(resp) return resp
                      }
                    }
                `
					);
				return { code };
			}
			return null;
		},
		async configureServer(server) {
			(server.httpServer as Server)?.on('upgrade', async (req, socket, head) => {
				const h = devGlobal.__serverHandle;
				if (h) {
					await h(req, socket, head);
				}
			});
		}
	} satisfies Plugin;
}
