/**
 * ECDH
 * @see https://webkit.org/demos/webcrypto/ecdh.html
 * Process:
 *            Client                 Server
 *  Step1   GenerateKeyEC       GenerateKeyEC
 *  Step2   Receive PublicKey   Receive PublicKey   - Exchange key
 *  Step3   computeShareSecret  computeShareSecret
 */
import { api } from '$lib/req';
import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import crypto from "crypto"

export const ecdh = (() => {
	const { subtle } = crypto;

	const algorithm_ECDH = {
		name: 'ECDH',
		namedCurve: 'P-256'
	};

	const algorithm_AES_CBC = {
		name: 'AES-CBC',
		length: 256
	};

	const shareKeyUsage = ['encrypt', 'decrypt'] as KeyUsage[];

	const ivGen = (num: number) => {
		let n = 16;
		const a = new Uint8Array(n);
		while (n--) {
			a[n] = Math.floor(
				(0xffff * Math.abs(Math.cos(((num / (n + 1)) % Math.PI) / Math.PI))) & 0xff
			);
		}
		return a.buffer;
	};

	const algorithm_AES_CBC_Gen = (n: number) => {
		return {
			...algorithm_AES_CBC,
			iv: ivGen(n)
		};
	};

	const genShareKey = async (data: ArrayBuffer) => {
		shareKey = await subtle.deriveKey(
			{
				...algorithm_ECDH,
				public: await loadKey(data, algorithm_ECDH, [])
			},
			priKey,
			algorithm_AES_CBC,
			true,
			shareKeyUsage
		);
		if (!browser) {
			const { kv } = await import('$lib/fix');
			await kv.set('shk', await exportKey(shareKey));
		}
	};

	let pubKey: CryptoKey;
	let priKey: CryptoKey;
	let shareKey: CryptoKey;

	const exportKey = async (key: CryptoKey) => {
		return await subtle.exportKey('raw', key);
	};
	const loadKey = async (key: ArrayBuffer, algorithm: AlgorithmIdentifier, usage: KeyUsage[]) => {
		return await subtle.importKey('raw', key, algorithm, true, usage);
	};

	const recover = async () => {
		if (!browser && !shareKey) {
			const { kv } = await import('$lib/fix');
			const shk = (await kv.get('shk', 'arrayBuffer')) as ArrayBuffer | undefined;
			if (shk) shareKey = await loadKey(shk, algorithm_AES_CBC, shareKeyUsage);
		}
	};

	const init = async (receiveKey?: ArrayBuffer) => {
		await recover();
		if (!priKey) {
			const keys = await subtle.generateKey(algorithm_ECDH, false, ['deriveKey']);
			pubKey = keys.publicKey;
			priKey = keys.privateKey;
		}
		if (receiveKey) {
			await genShareKey(receiveKey);
			return await exportKey(pubKey);
		} else {
			await genShareKey(await api('hello').post(await exportKey(pubKey)));
		}
	};

	return {
		init,
		enc: async (data: BufferSource, num: number) => {
			if (!shareKey && browser) {
				await init();
			}
			return await subtle.encrypt(algorithm_AES_CBC_Gen(num), shareKey, data);
		},
		dec: async (data: BufferSource, num: number) => {
			if (!shareKey) await recover();
			if (!shareKey) throw error(500, 'no share key');
			return await subtle.decrypt(algorithm_AES_CBC_Gen(num), shareKey, data);
		}
	};
})();
