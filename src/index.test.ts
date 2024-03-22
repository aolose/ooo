import { it, expect, describe } from 'vitest';
import { parseArray, arrayify, compressArray } from '$lib/utils';

const json = (a: unknown) => JSON.parse(JSON.stringify(a));

describe('test jsonEnc and jsonDec', () => {
	it('String', () => {
		const a = 'abc';
		expect(parseArray(arrayify(a))).toEqual(json(a));
	});
	it('Number', () => {
		const a = -1234.111;
		expect(parseArray(arrayify(a))).toEqual(json(a));
	});
	it('null', () => {
		const a = null;
		expect(parseArray(arrayify(a))).toEqual(json(a));
	});
	it('Array empty', () => {
		const a = [,];
		expect(parseArray(arrayify(a))).toEqual(json(a));
	});
	it('Array string', () => {
		const a = [[null], '1'];
		console.log(arrayify(a));
		expect(parseArray(arrayify(a))).toEqual(json(a));
	});
	it('Array', () => {
		const a = [null, '2'];
		expect(parseArray(arrayify(a))).toEqual(json(a));
	});
	it('Empty String', () => {
		expect(parseArray(arrayify(''))).toEqual('');
	});
	it('Empty Array', () => {
		expect(parseArray(arrayify([]))).toEqual([]);
	});
	it('Object', async () => {
		const a = { c: [{}], g: 'sdasda2', s: { d: { 3: [1, 2, 3, 4] }, r: null }, e: 1 };
		expect(parseArray(arrayify(a))).toEqual(json(a));
	});
	it('Empty Object', () => {
		expect(parseArray(arrayify({}))).toEqual({});
	});
});
