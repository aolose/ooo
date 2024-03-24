import { it, expect, describe } from 'vitest';
import { parseArray, arrayify } from '../../src/lib/utils';

const json = (a: unknown) => JSON.parse(JSON.stringify(a));

describe('test jsonEnc and jsonDec', () => {
	it('String', () => {
		const a = 'abc';
		expect(parseArray(arrayify(a))).toEqual(json(a));
	});

	it('String empty', () => {
		const a = '';
		expect(parseArray(arrayify(a))).toEqual(json(a));
	});

	it('Number', () => {
		const a = -1234.111;
		expect(parseArray(arrayify(a))).toEqual(json(a));
	});

	it('Number 2', () => {
		const a = 1711080570729;
		expect(parseArray(arrayify(a))).toEqual(json(a));
	});

	it('Number 3', () => {
		const a = 294577;
		expect(parseArray(arrayify(a))).toEqual(json(a));
	});

	it('null', () => {
		const a = null;
		expect(parseArray(arrayify(a))).toEqual(json(a));
	});

	it('Array empty', () => {
		const a: unknown[] = [];
		expect(parseArray(arrayify(a))).toEqual(json(a));
	});

	it('Array string', () => {
		const a = [[null], '1'];
		expect(parseArray(arrayify(a))).toEqual(json(a));
	});

	it('Array', () => {
		const a = [null, '2'];
		expect(parseArray(arrayify(a))).toEqual(json(a));
	});

	it('Array 1', () => {
		const a = [{ a: 1, c: 2 }, { b: 2 }];
		expect(parseArray(arrayify(a))).toEqual(json(a));
	});

	it('Array 3', () => {
		const a = ['', '2'];
		expect(parseArray(arrayify(a))).toEqual(json(a));
	});

	it('Array 2', async () => {
		const a = [294577, 1711080570729];
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

	it('Object 2', async () => {
		const a = {
			name: 'bg3_test.png',
			type: 'image/png',
			key: '2hiy5k16itiew9laxrfuxx75trwnwfb',
			size: 404628,
			updated: 1711264117438
		};
		expect(parseArray(arrayify(a))).toEqual(json(a));
	});

	it('Object 3', async () => {
		const a = {
			b: '',
			c: 2
		};
		expect(parseArray(arrayify(a))).toEqual(json(a));
	});

	it('Empty Object', () => {
		expect(parseArray(arrayify({}))).toEqual({});
	});
});
