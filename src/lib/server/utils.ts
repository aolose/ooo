export const bufHash = async (buf: ArrayBuffer) => {
	const hashBuf = await crypto.subtle.digest('SHA-1', buf);
	return Array.from(new Uint32Array(hashBuf), (a) => a.toString(36)).join('');
};

export const resp = (
	data: null | undefined | BodyInit,
	status = 200,
	headers?: Headers | object | Map<string, string>
) => {
	let headers1 = new Headers();
	if (headers) {
		if (headers instanceof Headers) {
			headers1 = headers;
		} else if (headers instanceof Map) {
			headers.forEach((k, v) => headers1.set(k, v));
		} else Object.entries(headers).forEach(([k, v]) => headers1.set(k.toString(), v.toString()));
	}

	if (data) {
		let cType = '';
		const type = data.constructor.name;
		if ('String' === type) {
			cType = 'str';
		} else if ('Number' === type) {
			cType = 'num';
		} else if (/Stream$|Buffer$|\dArray$/.test(type)) {
			cType = 'bin';
		} else {
			cType = 'json';
			data = JSON.stringify(data);
		}
		headers1.set('x-data-type', cType);
	}
	return new Response(data, {
		status,
		headers: headers1
	});
};
