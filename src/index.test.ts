import { it, expect, describe } from 'vitest';
import { parseArray, arrayify } from '$lib/utils';

describe('test jsonEnc and jsonDec', () => {
	it('String', () => {
		const a = 'abc';
		expect(parseArray(arrayify(a))).toEqual(a);
	});
	it('Number', () => {
		const a = 100;
		expect(parseArray(arrayify(a))).toEqual(a);
	});
	it('null', () => {
		const a = null;
		expect(parseArray(arrayify(a))).toEqual(a);
	});
	it('Array', () => {
		const a = [1, '2', [], [], 1, [], [], [], {}];
		expect(parseArray(arrayify(a))).toEqual(a);
	});
	it('Array', () => {
		const a = [null, '2'];
		expect(parseArray(arrayify(a))).toEqual(a);
	});
	it('Empty String', () => {
		expect(parseArray(arrayify(''))).toEqual('');
	});
	it('Empty Array', () => {
		expect(parseArray(arrayify([]))).toEqual([]);
	});
	it('Object', () => {
		const a = { c: [], e: 1 };
		expect(parseArray(arrayify(a))).toEqual(a);
	});
	it('Empty Object', () => {
		expect(parseArray(arrayify({}))).toEqual({});
	});
});
