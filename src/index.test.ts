import { it, expect, describe } from 'vitest';
import { decodeArray, encodeToArray } from '$lib/utils';

describe('test jsonEnc and jsonDec', () => {
	it('String', () => {
		const a = 'abc';
		expect(decodeArray(encodeToArray(a))).toEqual(a);
	});
	it('Number', () => {
		const a = 100;
		expect(decodeArray(encodeToArray(a))).toEqual(a);
	});
	it('null', () => {
		const a = null;
		expect(decodeArray(encodeToArray(a))).toEqual(a);
	});
	it('Array', () => {
		const a = [1, 2, '2', '3'];
		expect(decodeArray(encodeToArray(a))).toEqual(a);
	});
	it('Empty Array', () => {
		expect(decodeArray(encodeToArray([]))).toEqual([]);
	});
	it('Object', () => {
		const a = { c: { d: { e: 1 } } };
		expect(decodeArray(encodeToArray(a))).toEqual(a);
	});
	it('Empty Object', () => {
		expect(decodeArray(encodeToArray({}))).toEqual({});
	});
});
