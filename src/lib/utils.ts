export function fileSize(size = 0) {
	const m = ['B', 'KB', 'MB', 'GB'];
	let n = 0;
	while (size > 512 && n < 3) {
		size = size / 1024;
		n++;
	}
	return size.toFixed(1) + m[n];
}

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
	End,
	String,
	Number,
	Object,
	Array,
	Null,
	True,
	False,
	Size
}

export const encodeToArray = (o: Data): number[] => {
	if (!o) {
		if (o === null) return [Types.Null];
		if (o === undefined) return [];
		if (o === 0) return [Types.Number, 0];
		return [Types.False];
	}
	const t = typeof o;
	if (t === 'object') {
		const s = [];
		let n: number[] = [];
		if (Array.isArray(o)) {
			s.push(Types.Array);
			for (let i = 0, l = o.length; i < l; i++) {
				let v = encodeToArray(o[i]);
				if (v.length === 0) v = [Types.Null];
				n = n.concat(v, Types.End);
			}
		} else {
			s.push(Types.Object);
			for (const [k, v] of Object.entries(o)) {
				const e = encodeToArray(v);
				if (!e.length) continue;
				n = n.concat(str2Arr(k + ':'), e, Types.End);
			}
		}
		return s.concat(n);
	} else {
		if (t === 'number') return [Types.Number].concat(str2Arr(o.toString()));
		if (t === 'string') return [Types.String].concat(str2Arr(o as string));
		if (t === 'boolean') return [Types.True];
		return [];
	}
};

export const decodeArray = <T>(arr: number[] | Uint8Array) => {
	const t = arr[0];
	const l = arr.length;
	const scan = (s: number) => {
		let num = 0;
		for (let i = s; i < l; i++) {
			const c = arr[i];
			if (c === Types.End) {
				if (!--num) return i;
			} else if (c < Types.Size) num++;
		}
		throw Error('parse error' + num);
	};
	if (t === Types.Object) {
		const o: { [key: string]: Data } = {};
		for (let i = 1, s = 1; i < l; i++) {
			if (arr[i] === 58) {
				const key = String.fromCharCode(...arr.slice(s, i));
				s = i + 1;
				i = scan(s);
				o[key] = decodeArray(arr.slice(s, i)) as Data;
				s = i + 1;
			}
		}
		return o as T;
	}
	if (t === Types.Array) {
		const o: Data[] = [];
		for (let i = 1, s = 1; i < l; i++) {
			i = scan(s);
			o.push(decodeArray(arr.slice(s, i)) as Data);
			s = i + 1;
		}
		return o as T;
	}
	if (t === Types.String) return String.fromCharCode(...arr.slice(1)) as T;
	if (t === Types.Number) return +String.fromCharCode(...arr.slice(1)) as T;
	if (t === Types.Null) return null as T;
	if (t === Types.True) return true as T;
	if (t === Types.False) return false as T;
	throw Error('ParseError: unknown type');
};
