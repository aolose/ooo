import {Apis} from '$lib/server/apis';
import type {serverHandle} from '../../../vite';
import type {Connect} from 'vite';
import type {WebSocketServer} from 'ws';

const wsPool = {} as { [key: string]: WebSocketServer };

export const handle: serverHandle = async (req, socket, head) => {
    const {pathname} = new URL(req.url || '', 'wss://base.url');
    const fn = Apis[pathname.slice(5)]?.WS;
    if (fn) {
        if (socket) {
            const {WebSocketServer} = await import('ws');

            let srv = wsPool[pathname];
            if (!srv) {
                srv = new WebSocketServer({noServer: true});
                wsPool[pathname] = srv;
                srv.on('connection', (serv: WebSocketServer) => {
                    fn(serv, serv);
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
                    accept: () => void,
                    close: (code: number, reason?: string) => void
                    send: (message: string | ArrayBuffer | ArrayBufferView) => void,
                    on: (
                        eventName: 'error' | 'message' | 'close',
                        callback: (this: WebSocket, event: Event | string) => void
                    ) => void;
                };
            server.accept();
            server.on = function (event, cb) {
                server.addEventListener(event, (e) => {
                    if (event === 'message') cb.call(server, (e as MessageEvent).data)
                    else if (event === 'error') cb.call(server, e)
                    else if (event === 'close') cb.call(server, e)
                })
            }
            fn(server, client);
            return new Response(null, {
                status: 101,
                webSocket: client
            });
        }
    }
};
