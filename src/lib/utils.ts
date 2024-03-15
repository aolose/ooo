export function fileSize(size = 0) {
	const m = ['B', 'KB', 'MB', 'GB'];
	let n = 0;
	while (size > 512 && n < 3) {
		size = size / 1024;
		n++;
	}
	return size.toFixed(1) + m[n];
}

const num2Arr = (n: number) => {
	let ng = 0;
	if (n < 0) {
		ng = 1;
		n = -n;
	}
	const a = [];
	while (n > 0xff) {
		a.push(n & 0xff);
		n = n >> 8;
	}
	if (n) a.push(n);
	if (ng) a.push(0);
	return a;
};

const arr2Num = (bv: number[] | Uint8Array) => {
	return (bv as number[]).reduce((a, b, c) => {
		if (!b) return -a;
		return a + (b << (8 * c));
	}, 0);
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

export const arrayify = (o: Data): number[] => {
	if (!o) {
		if (o === null) return [Types.Null];
		if (o === undefined) return [];
		if (o === 0) return [7, 0];
		if (o === '') return [Types.String];
		return [Types.False];
	}
	const t = typeof o;
	if (t === 'object') {
		const s = [];
		let ks: number[] = [];
		let vs: number[] = [];
		let n: number[] = [];
		let last = 0;
		if (Array.isArray(o)) {
			s.push(Types.Array);
			for (let i = 0, l = o.length; i < l; i++) {
				let v = arrayify(o[i]);
				if (v.length === 0) v = [Types.Null];
				const z = v.slice(1);
				const type = v[0];
				vs = vs.concat(z);
				if (type === Types.Number) {
					ks.push(v.length + 6);
					if (z.length) last = vs.length;
				} else {
					ks.push(v[0]);
					if (type < 5) vs.push(0);
					if (z.length) last = vs.length - 1;
				}
			}
		} else {
			s.push(Types.Object);
			for (const [k, v] of Object.entries(o)) {
				const e = arrayify(v);
				if (!e.length) continue;
				ks = ks.concat(str2Arr(k), e[0]);
				const z = e.slice(1);
				vs = vs.concat(z, 0);
				if (z.length) last = vs.length - 1;
			}
		}
		n = ks.length ? ks.concat(0).concat(vs.slice(0, last)) : [];
		return s.concat(n);
	} else {
		if (t === 'number') {
			const a = num2Arr(o as number);
			return [Types.Number].concat(a);
		}
		if (t === 'string') {
			const a: number[] = [Types.String].concat(str2Arr(o as string));
			return a;
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
		if (key) (parent as { [key: string]: typeof a })[key] = a;
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
		if (!arr[i + 1]) i++;
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
		if (kn) {
			i++;
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
