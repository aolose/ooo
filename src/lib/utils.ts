export function fileSize(size = 0) {
	const m = ['B', 'KB', 'MB', 'GB'];
	let n = 0;
	while (size > 512 && n < 3) {
		size = size / 1024;
		n++;
	}
	return size.toFixed(1) + m[n];
}

const num2Arr = (n: number): number[] => {
	let ng = 0;
	if (n < 0) {
		ng = 1;
		n = -n;
	}
	const f = n % 1;
	let decimal: number[] | undefined;
	if (f) {
		decimal = num2Arr(parseInt(n.toString().split('.')[1]));
		n = n << 0;
	}
	let a = [];
	while (n > 0xfe) {
		const r = n & 0xff;
		a.push((r & 0xfe) + 1); // 2~255
		n = n >> 8;
		if (r === 0xff) n++;
	}
	if (n) a.push(n + 1);
	if (decimal) a = a.concat(1, decimal);
	if (ng) a.push(1);
	return a;
};

const arr2Num = (bv: number[] | Uint8Array): number => {
	const e = bv.length;
	if (!e) return 0;
	let sum = 0;
	let i = 0;
	for (; i < e; i++) {
		const b = bv[i];
		if (b === 1) break;
		sum += (b - 1) << (8 * i);
	}
	if (i === e) return sum;
	if (i === e - 1) return -sum;
	const decimal = arr2Num(bv.slice(i + 1));
	if (decimal < 0) sum = -sum;
	return sum + decimal / Math.pow(10, ~~Math.log10(Math.abs(decimal)) + 1);
};

const str2Arr = (s: string) => {
	const n: number[] = [];
	let i = s.length;
	while (i--) n[i] = s.charCodeAt(i);
	return n;
};

export const groupArr = (size: number, data: unknown[]) => {
	const l = data.length;
	const table = [] as unknown[][];
	if (l) {
		for (let i = 0; i < l; i += size) {
			table.push(data.slice(i, i + size));
		}
	}
	return table;
};
type Data = string | number | object | null;

enum Types {
	String = 1,
	Number,
	Object,
	Array,
	Null,
	True,
	False
}

const end = Symbol();
type ArrayIfyResult = number[] & { [end]?: Types };

export const arrayify = (o: Data): ArrayIfyResult => {
	if (!o) {
		if (o === null) return [Types.Null];
		if (o === undefined) return [];
		if (o === 0) return [Types.Number];
		if (o === '') return [Types.String];
		return [Types.False];
	}
	const t = typeof o;
	if (t === 'object') {
		let s: ArrayIfyResult = [];
		let ks: number[] = [];
		let vs: number[] = [];
		let n: number[] = [];
		let last = 0;
		let endType: Types | undefined;

		const setVs = (v: ArrayIfyResult) => {
			const [type, ...z] = v;
			if (z.length) last = vs.length;
			if (type === Types.Object || type === Types.Array) {
				const lt = v[end];
				if (lt === undefined || lt === Types.String) vs.push(0);
			} else if (type === Types.String) vs.push(0);
		};

		if (Array.isArray(o)) {
			s.push(Types.Array);
			for (let i = 0, l = o.length; i < l; i++) {
				let v = arrayify(o[i]);
				if (v.length === 0) v = [Types.Null];
				const z = v.slice(1);
				const type = v[0];
				if (type === Types.Array || type === Types.Object) endType = v[end];
				else endType = type;
				vs = vs.concat(z);
				if (type === Types.Number) {
					if (!z.length) ks.push(type);
					else {
						ks.push(v.length + 6);
						last = vs.length;
					}
				} else {
					ks.push(type);
					setVs(v);
				}
			}
		} else {
			s.push(Types.Object);
			for (const [k, v] of Object.entries(o)) {
				const e = arrayify(v);
				if (!e.length) continue;
				const type = e[0];
				if (type === Types.Array || type === Types.Object) endType = e[end];
				else endType = type;
				ks = ks.concat(str2Arr(k), type);
				const z = e.slice(1);
				vs = vs.concat(z);
				setVs(e);
			}
		}
		n = ks.length ? ks.concat(0).concat(vs.slice(0, last)) : [];
		s = s.concat(n);
		s[end] = endType;
		return s;
	} else {
		if (t === 'number') {
			const a = num2Arr(o as number);
			return [Types.Number].concat(a);
		}
		if (t === 'string') {
			return [Types.String].concat(str2Arr(o as string));
		}
		if (t === 'boolean') return [Types.True];
		return [];
	}
};

declare function ParseArray<T>(arr: number[] | Uint8Array): T;
declare function ParseArray(
	arr: number[] | Uint8Array,
	index: number,
	type: Types,
	parent: unknown,
	key?: string
): number;

export const parseArray: typeof ParseArray = <T>(
	arr: number[] | Uint8Array,
	index: number = 0,
	type?: Types,
	parent?: unknown,
	key?: string
) => {
	const attachToParent = (a: unknown) => {
		if (key !== undefined) (parent as { [key: string]: typeof a })[key] = a;
		else (parent as (typeof a)[]).push(a);
	};
	const l = arr.length;
	if (!l) return undefined as T;
	const t = type || arr[index];
	if (t === Types.Null) {
		if (parent) {
			attachToParent(null);
			return index;
		} else return null as T;
	} else if (t === Types.False) {
		if (parent) {
			attachToParent(false);
			return index;
		} else return false as T;
	} else if (t === Types.True) {
		if (parent) {
			attachToParent(true);
			return index;
		} else return true as T;
	} else if (t === Types.Number) {
		const s = type ? index : index + 1;
		let i = s;
		while (arr[i]) i++;
		const n = arr2Num(arr.slice(s, i));
		if (parent) {
			attachToParent(n);
			return i + 1;
		}
		return n as T;
	} else if (t === Types.String) {
		const s = type ? index : index + 1;
		let i = s + 1;
		while (arr[i]) i++;
		const a = String.fromCharCode(...arr.slice(s, i));
		if (parent) {
			attachToParent(a);
			return i + 1;
		}
		return a;
	} else if (t === Types.Array) {
		const a: unknown[] = [];
		const s = type ? index : index + 1;
		let i = s;
		let e = i;
		for (; i < l; i++) {
			if (!arr[i]) {
				e = i;
				break;
			}
		}
		if (s !== e) {
			i = e + 1;
			for (let t = s; t < e; t++) {
				const tp = arr[t];
				if (tp > 7) {
					const nn = tp - 7;
					const ne = i + nn;
					a.push(arr2Num(arr.slice(i, ne)));
					i += nn;
				} else i = parseArray(arr, i, tp, a);
			}
		} else i++;
		if (parent) {
			attachToParent(a);
			return i;
		}
		return a;
	} else if (t === Types.Object) {
		const a = {};
		const ks = [];
		const types = [];
		let i = type ? index : index + 1;
		let s = i;
		for (; i < l; i++) {
			const c = arr[i];
			if (c < 8) {
				if (!c) break;
				ks.push(String.fromCharCode(...arr.slice(s, i)));
				types.push(c);
				s = i + 1;
			}
		}
		const kn = ks.length;
		i++;
		if (kn) {
			for (let ki = 0; ki < kn; ki++) {
				i = parseArray(arr, i, types[ki], a, ks[ki]);
			}
		}
		if (parent) {
			attachToParent(a);
			return i;
		}
		return a;
	}
};

const readStream = async (r: CompressionStream | DecompressionStream) => {
	const chunks: Uint8Array[] = [];
	const sizes: number[] = [0];
	let size = 0;
	const reader = r.readable.getReader();
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		size += value.length;
		sizes.push(size);
		chunks.push(value);
	}
	const arr = new Uint8Array(size);
	for (let i = 0, l = chunks.length; i < l; i++) arr.set(chunks[i], sizes[i]);
	return arr;
};

export const gzip = async (arr: number[]) => {
	const ds = new CompressionStream('gzip');
	const writer = ds.writable.getWriter();
	await writer.write(String.fromCharCode(...arr));
	await writer.close();
	return ds.readable;
};

export const ugzip = async <T>(body: ReadableStream<Uint8Array> | null) => {
	if (!body) return;
	const ds = new DecompressionStream('gzip');
	body.pipeThrough(ds);
	return parseArray<T>(await readStream(ds));
};
