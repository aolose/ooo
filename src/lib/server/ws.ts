import { Apis } from '$lib/server/apis';
import type { serverHandle } from '../../../vite';
import type { Connect } from 'vite';
import type { WebSocketServer } from 'ws';

const wsPool = {} as { [key: string]: WebSocketServer };

export const handle: serverHandle = async (req, socket, head) => {
	const { pathname } = new URL(req.url || '', 'wss://base.url');
	const fn = Apis[pathname.slice(5)]?.WS;
	if (fn) {
		if (socket) {
			const { WebSocketServer } = await import('ws');

			let srv = wsPool[pathname];
			if (!srv) {
				srv = new WebSocketServer({ noServer: true });
				wsPool[pathname] = srv;
				srv.on('connection', (serv: WebSocketServer) => {
					fn(serv);
				});
			}
			srv.handleUpgrade(req as Connect.IncomingMessage, socket, head, (ws) => {
				srv.emit('connection', ws, req);
			});
		} else {
			// cloudflare Worker environment
			const upgradeHeader = (req as Request).headers.get('Upgrade');
			if (!upgradeHeader || upgradeHeader !== 'websocket') return;
			const webSocketPair = new WebSocketPair();
			const client = webSocketPair[0],
				server = webSocketPair[1] as WebSocket & {
					on: (
						eventName: 'connection' | 'error' | 'message' | 'close',
						callback: (this: WebSocket, event: Event) => void
					) => void;
				};

			if (!server.on) {
				server.on = function (event, cb) {
					switch (event) {
						case 'close':
							server.onclose = cb;
							break;
						case 'error':
							server.onerror = cb;
							break;
						case 'connection':
							server.onopen = cb;
							break;
					}
				};
			}

			fn(server, client);
			return new Response(null, {
				status: 101,
				webSocket: client
			});
		}
	}
};