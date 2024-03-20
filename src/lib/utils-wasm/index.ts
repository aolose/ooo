import { browser } from '$app/environment';

export const arrayify = async (o:object) => {
	if (browser) {
		const wasm = await import('./pkg');
		await wasm.default();
		return wasm.arrayify(o);
	} else {
		return { ...require('./node') }.arrayify(o);
	}
};